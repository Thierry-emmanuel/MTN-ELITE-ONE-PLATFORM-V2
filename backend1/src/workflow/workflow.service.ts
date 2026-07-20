/**
 * WorkflowService — Sprint 3
 * -----------------------------------------------------------------------
 * Stateful transition engine for editorial entities.
 * Validates allowed transitions, persists new status, and emits audit log.
 *
 * Transition graph (articles):
 *   DRAFT          → IN_REVIEW
 *   IN_REVIEW      → NEEDS_CHANGES | APPROVED
 *   NEEDS_CHANGES  → IN_REVIEW
 *   APPROVED       → PUBLISHED | DRAFT
 *   PUBLISHED      → ARCHIVED
 *   ARCHIVED       → DRAFT   (restore)
 */
import {
  Injectable, BadRequestException, ForbiddenException, Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument, ArticleStatus } from '../articles/schemas/article.schema';
import { AuditService } from '../iam/audit.service';
import type { RequestUser } from '../iam/guards/permissions.guard';

export type WorkflowStatus = `${ArticleStatus}`;

interface Transition {
  from:    WorkflowStatus[];
  to:      WorkflowStatus;
  /** IAM action needed (from permission catalog) — e.g. 'articles.approve' */
  require: string;
}

const ARTICLE_TRANSITIONS: Transition[] = [
  { from: ['DRAFT'],                             to: 'IN_REVIEW',     require: 'articles.update' },
  { from: ['IN_REVIEW'],                         to: 'NEEDS_CHANGES', require: 'articles.approve' },
  { from: ['IN_REVIEW'],                         to: 'APPROVED',      require: 'articles.approve' },
  { from: ['NEEDS_CHANGES'],                     to: 'IN_REVIEW',     require: 'articles.update' },
  { from: ['APPROVED'],                          to: 'PUBLISHED',     require: 'articles.publish' },
  { from: ['APPROVED'],                          to: 'DRAFT',         require: 'articles.approve' },
  { from: ['PUBLISHED'],                         to: 'ARCHIVED',      require: 'articles.archive' },
  { from: ['ARCHIVED', 'NEEDS_CHANGES'],         to: 'DRAFT',         require: 'articles.update' },
];

/** Map of entity key → allowed transition table */
const TRANSITION_TABLES: Record<string, Transition[]> = {
  articles: ARTICLE_TRANSITIONS,
};

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
    private readonly audit: AuditService,
  ) {}

  // ── Retrieve a model by entity name ─────────────────────────────────
  private modelFor(entity: string): Model<ArticleDocument> {
    if (entity === 'articles') return this.articleModel;
    throw new BadRequestException(`No workflow configured for entity "${entity}"`);
  }

  // ── Get allowed next transitions from a given status ────────────────
  getAllowedTransitions(entity: string, currentStatus: string): WorkflowStatus[] {
    const table = TRANSITION_TABLES[entity];
    if (!table) return [];
    return table
      .filter(t => t.from.includes(currentStatus as WorkflowStatus))
      .map(t => t.to);
  }

  // ── Validate + execute a transition ─────────────────────────────────
  async transition(
    entity: string,
    id:     string,
    to:     WorkflowStatus,
    actor:  RequestUser,
    resolvedPermissions: string[],
  ): Promise<{ id: string; status: WorkflowStatus; previousStatus: WorkflowStatus }> {
    const model = this.modelFor(entity);
    const doc   = await model.findById(id).lean();
    if (!doc) throw new NotFoundException(`${entity} ${id} introuvable`);

    const currentStatus = (doc as { status?: string }).status as WorkflowStatus | undefined ?? 'DRAFT';

    // Find the matching transition rule
    const table  = TRANSITION_TABLES[entity] ?? [];
    const rule   = table.find(t => t.from.includes(currentStatus) && t.to === to);
    if (!rule) {
      throw new BadRequestException(
        `Transition "${currentStatus}" → "${to}" non autorisée pour ${entity}`,
      );
    }

    // Check IAM permission
    const [mod, action] = rule.require.split('.');
    const hasPermission =
      resolvedPermissions.includes('*') ||
      resolvedPermissions.includes(`${mod}.*`) ||
      resolvedPermissions.includes(rule.require) ||
      resolvedPermissions.includes(`${rule.require}:own`);

    if (!hasPermission) {
      throw new ForbiddenException(`Permission requise: ${rule.require}`);
    }

    const publishedAt = to === 'PUBLISHED' ? new Date() : undefined;

    await model.findByIdAndUpdate(id, {
      $set: {
        status: to,
        ...(publishedAt ? { publishedAt } : {}),
      },
    });

    this.audit.log({
      actorId:    actor.id,
      actorEmail: actor.email,
      action:     `${entity}.workflow.${currentStatus.toLowerCase()}->${to.toLowerCase()}`,
      targetType: entity,
      targetId:   String(id),
      metadata:   { from: currentStatus, to },
    });

    this.logger.log(`[Workflow] ${entity}/${id}: ${currentStatus} → ${to} by ${actor.email}`);

    return { id, status: to, previousStatus: currentStatus };
  }
}
