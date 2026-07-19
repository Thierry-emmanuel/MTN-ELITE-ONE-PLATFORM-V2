import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '../users/user.entity';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Catalogue a media asset (admin)' })
  create(@Body() dto: CreateMediaDto) {
    return this.media.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Browse the media library (filter by type, relations or tag)' })
  findAll(
    @Query('type') type?: string,
    @Query('relatedMatchId') relatedMatchId?: number,
    @Query('relatedClubId') relatedClubId?: number,
    @Query('relatedPlayerId') relatedPlayerId?: number,
    @Query('tag') tag?: string,
  ) {
    return this.media.findAll({ type, relatedMatchId, relatedClubId, relatedPlayerId, tag });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one media asset' })
  findOne(@Param('id') id: string) {
    return this.media.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
