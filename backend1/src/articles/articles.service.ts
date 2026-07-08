import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument, ArticleStatus } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

export interface ArticleFilters {
  status?:   string;
  category?: string;
  search?:   string;
  page:      number;
  limit:     number;
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,
  ) {}

  // ── CREATE ─────────────────────────────────────────────────────────────────

  async create(dto: CreateArticleDto): Promise<Article> {
    const existing = await this.articleModel.findOne({ slug: dto.slug }).lean();
    if (existing) throw new BadRequestException(`Slug "${dto.slug}" already exists`);

    // Compute reading time from the French body (fallback to English)
    const bodyText  = dto.body?.fr ?? dto.body?.en ?? '';
    const readTime  = dto.read_time ?? Math.max(1, Math.ceil(bodyText.split(/\s+/).length / 200));

    const status = dto.status ?? ArticleStatus.DRAFT;

    const article = new this.articleModel({
      ...dto,
      read_time:   readTime,
      status,
      publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
      views:       0,
      comments:    [],
    });

    return article.save();
  }

  // ── READ — paginated list ─────────────────────────────────────────────────

  async findAll(filters: ArticleFilters): Promise<{
    data: Article[]; total: number; page: number; totalPages: number;
  }> {
    const query: Record<string, unknown> = {};

    if (filters.status)   query.status   = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      // text index search; falls back to regex if text index not set up yet
      try {
        query.$text = { $search: filters.search };
      } catch {
        query['title.fr'] = { $regex: filters.search, $options: 'i' };
      }
    }

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.articleModel
        .find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .select('-comments')
        .lean(),
      this.articleModel.countDocuments(query),
    ]);

    return { data, total, page: filters.page, totalPages: Math.ceil(total / filters.limit) };
  }

  // ── READ — featured ───────────────────────────────────────────────────────

  async getFeatured(): Promise<Article[]> {
    return this.articleModel
      .find({ featured: true, status: ArticleStatus.PUBLISHED })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-comments')
      .lean();
  }

  // ── READ — by slug (increments views) ────────────────────────────────────

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleModel
      .findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
      .lean();
    if (!article) throw new NotFoundException(`Article "${slug}" not found`);
    return article;
  }

  // ── READ — by id (internal) ───────────────────────────────────────────────

  async findById(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id);
    if (!article) throw new NotFoundException(`Article "${id}" not found`);
    return article;
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findById(id);

    // Recompute reading time if body changed
    if (dto.body) {
      const bodyText = dto.body.fr ?? dto.body.en ?? '';
      (dto as any).read_time = Math.max(1, Math.ceil(bodyText.split(/\s+/).length / 200));
    }

    if (dto.status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
      article.publishedAt = new Date();
    }

    Object.assign(article, dto);
    return article.save();
  }

  // ── PUBLISH ───────────────────────────────────────────────────────────────

  async publish(id: string): Promise<Article> {
    const article = await this.findById(id);
    article.status      = ArticleStatus.PUBLISHED;
    article.publishedAt = new Date();
    return article.save();
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const result = await this.articleModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException(`Article "${id}" not found`);
  }

  // ── COMMENTS ──────────────────────────────────────────────────────────────

  async getComments(articleId: string): Promise<Article['comments']> {
    const article = await this.articleModel
      .findById(articleId)
      .select('comments')
      .lean();
    if (!article) throw new NotFoundException(`Article "${articleId}" not found`);
    return article.comments ?? [];
  }

  async addComment(
    articleId: string,
    authorName: string,
    content: string,
  ): Promise<Article> {
    const article = await this.findById(articleId);
    article.comments.push({
      authorName: authorName.trim(),
      content:    content.trim(),
      createdAt:  new Date(),
      likes:      0,
      replies:    [],
    } as any);
    return article.save();
  }

  async addReply(
    articleId: string,
    commentId: string,
    authorName: string,
    content: string,
  ): Promise<Article> {
    const article = await this.findById(articleId);
    const comment = article.comments.find(
      c => (c as any)._id?.toString() === commentId,
    );
    if (!comment) throw new NotFoundException(`Comment "${commentId}" not found`);
    comment.replies.push({
      authorName: authorName.trim(),
      content:    content.trim(),
      createdAt:  new Date(),
      likes:      0,
    } as any);
    return article.save();
  }

  async likeComment(articleId: string, commentId: string): Promise<{ likes: number }> {
    const result = await this.articleModel.findOneAndUpdate(
      { _id: articleId, 'comments._id': new Types.ObjectId(commentId) },
      { $inc: { 'comments.$.likes': 1 } },
      { new: true },
    ).lean();
    if (!result) throw new NotFoundException('Article or comment not found');
    const comment = result.comments?.find(c => (c as any)._id?.toString() === commentId);
    return { likes: comment?.likes ?? 0 };
  }
}