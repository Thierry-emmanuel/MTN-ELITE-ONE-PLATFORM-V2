import {
  Controller, Post, Delete, UseInterceptors, UploadedFile,
  BadRequestException, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { extname } from 'path';
import { CloudinaryService } from './cloudinary.service';

const ALLOWED_SCOPES: Record<string, string[]> = {
  'seasons/logo': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  'clubs/logo': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  'clubs/banner': ['image/jpeg', 'image/png', 'image/webp'],
  'clubs/stadium': ['image/jpeg', 'image/png', 'image/webp'],
  'clubs/president': ['image/jpeg', 'image/png', 'image/webp'],
  'clubs/video': ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  'players/photo': ['image/jpeg', 'image/png', 'image/webp'],
  'players/secondary-photo': ['image/jpeg', 'image/png', 'image/webp'],
  'players/video': ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  'coaches/photo': ['image/jpeg', 'image/png', 'image/webp'],
  'articles/cover': ['image/jpeg', 'image/png', 'image/webp'],
  'articles/gallery': ['image/jpeg', 'image/png', 'image/webp'],
  'articles/video': ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  'articles/video-thumbnail': ['image/jpeg', 'image/png', 'image/webp'],
  'hero-banners/image': ['image/jpeg', 'image/png', 'image/webp'],
  'hall-of-fame/photo': ['image/jpeg', 'image/png', 'image/webp'],
  'awards/photo': ['image/jpeg', 'image/png', 'image/webp'],
  generic: [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
  ],
};

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // ── Legacy flat endpoint, kept for backward compatibility (Evaluated first to avoid matching :entity/:field) ──
  @Post('file')
  @ApiOperation({ summary: '[Legacy] Upload an unscoped file (max 50MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        const allowed = ALLOWED_SCOPES.generic;
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only images and videos are allowed'), false);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `${uniqueSuffix}`;
    const uploadResult = await this.cloudinaryService.uploadFile(file, 'generic', publicId);

    return {
      url: uploadResult.secure_url,
      filename: `${publicId}${extname(file.originalname)}`,
      mimetype: file.mimetype,
      size: file.size,
      scope: 'generic',
    };
  }

  // ── Scoped endpoint ──
  @Post(':entity/:field')
  @ApiOperation({ summary: 'Upload a file scoped to an entity/field, e.g. clubs/logo' })
  @ApiParam({ name: 'entity', example: 'clubs' })
  @ApiParam({ name: 'field', example: 'logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (req, file, cb) => {
        const { entity, field } = req.params as { entity: string; field: string };
        const scopeKey = `${entity}/${field}`;
        const allowed = ALLOWED_SCOPES[scopeKey] ?? ALLOWED_SCOPES.generic;
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type "${file.mimetype}" is not allowed for ${scopeKey}. Allowed: ${allowed.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadScopedFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('entity') entity: string,
    @Param('field') field: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `${uniqueSuffix}`;
    const folder = `${entity}/${field}`;
    const uploadResult = await this.cloudinaryService.uploadFile(file, folder, publicId);

    return {
      url: uploadResult.secure_url,
      filename: `${publicId}${extname(file.originalname)}`,
      mimetype: file.mimetype,
      size: file.size,
      scope: folder,
    };
  }

  @Delete(':entity/:field/:filename')
  @ApiOperation({ summary: 'Delete a previously uploaded file' })
  async deleteScopedFile(
    @Param('entity') entity: string,
    @Param('field') field: string,
    @Param('filename') filename: string,
  ) {
    const folder = `${entity}/${field}`;
    const publicId = `${folder}/${filename}`;
    try {
      await this.cloudinaryService.deleteFile(publicId);
      return { message: 'File deleted' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file from Cloudinary: ${error.message}`);
    }
  }
}