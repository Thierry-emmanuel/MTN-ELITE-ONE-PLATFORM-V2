import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditEntry {
  actorId?: number | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string | number;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>,
  ) {}

  /** Fire-and-forget append. Auditing must never break the business action. */
  log(entry: AuditEntry): void {
    const row = this.repo.create({
      actorId: entry.actorId ?? null,
      actorEmail: entry.actorEmail ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId != null ? String(entry.targetId) : null,
      metadata: entry.metadata ?? null,
      ip: entry.ip ?? null,
    });
    this.repo.save(row).catch((e) => this.logger.warn(`audit write failed: ${e.message}`));
  }

  async find(opts: {
    page?: number; limit?: number;
    actorId?: number; action?: string; targetType?: string; targetId?: string;
    from?: string; to?: string;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(200, Math.max(1, opts.limit ?? 50));
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC');

    if (opts.actorId) qb.andWhere('a.actor_id = :actorId', { actorId: opts.actorId });
    if (opts.action) qb.andWhere('a.action LIKE :action', { action: `${opts.action}%` });
    if (opts.targetType) qb.andWhere('a.target_type = :tt', { tt: opts.targetType });
    if (opts.targetId) qb.andWhere('a.target_id = :ti', { ti: opts.targetId });
    if (opts.from) qb.andWhere('a.created_at >= :from', { from: opts.from });
    if (opts.to) qb.andWhere('a.created_at <= :to', { to: opts.to });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  /** Login history of one user = their auth.* audit entries. */
  loginHistory(userId: number, limit = 50) {
    return this.repo.find({
      where: [{ actorId: userId, action: 'auth.login' }, { actorId: userId, action: 'auth.logout' }],
      order: { createdAt: 'DESC' },
      take: Math.min(200, limit),
    });
  }
}
