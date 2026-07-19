import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, Query, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

// ─── Comment DTOs (inline — simple enough not to need separate files) ──────────
class CreateCommentDto {
  authorName!: string;
  content!: string;
  parentId?: string; // reply to an existing comment
}

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // ── Article CRUD ───────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  /**
   * GET /articles
   * ?status=PUBLISHED&category=MATCH_REPORT&search=coton&page=1&limit=20
   */
  @Get()
  @ApiOperation({ summary: 'List articles with optional filters' })
  @ApiQuery({ name: 'status',   required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'page',     required: false, type: Number })
  @ApiQuery({ name: 'limit',    required: false, type: Number })
  findAll(
    @Query('status')   status?: string,
    @Query('category') category?: string,
    @Query('search')   search?: string,
    @Query('page')     page?: number,
    @Query('limit')    limit?: number,
  ) {
    return this.articlesService.findAll({
      status, category, search,
      page:  page  ? +page  : 1,
      limit: limit ? +limit : 20,
    });
  }

  /**
   * GET /articles/featured
   * Returns the featured (à la une) article.
   */
  @Get('featured')
  @ApiOperation({ summary: 'Get featured articles' })
  getFeatured() {
    return this.articlesService.getFeatured();
  }

  /**
   * GET /articles/:slug
   * Slug lookup — increments view count.
   */
  // Phase 4 (Story Builder) — load by Mongo id for the OS builder;
  // must precede @Get(':slug') or the slug route swallows it.
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get one article by id' })
  findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single article by slug and increment views' })
  @ApiParam({ name: 'slug' })
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a draft article' })
  publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  /**
   * GET /articles/:id/comments
   * Returns all comments (with replies) for an article.
   */
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for an article' })
  getComments(@Param('id') id: string) {
    return this.articlesService.getComments(id);
  }

  /**
   * POST /articles/:id/comments
   * Add a top-level comment or reply.
   * Body: { authorName, content, parentId? }
   */
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment (or reply) to an article' })
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return dto.parentId
      ? this.articlesService.addReply(id, dto.parentId, dto.authorName, dto.content)
      : this.articlesService.addComment(id, dto.authorName, dto.content);
  }

  /**
   * PATCH /articles/:id/comments/:commentId/like
   * Increment like count on a comment.
   */
  @Patch(':id/comments/:commentId/like')
  @ApiOperation({ summary: 'Like a comment' })
  likeComment(
    @Param('id')        id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.articlesService.likeComment(id, commentId);
  }
}