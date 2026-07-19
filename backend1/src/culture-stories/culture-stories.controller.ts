import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CultureStoriesService } from './culture-stories.service';
import { CreateCultureStoryDto } from './dto/create-culture-story.dto';


import { Secured } from '../iam/guards/permissions.guard';
@ApiTags('culture-stories')
@ApiBearerAuth()
@Controller('culture-stories')
export class CultureStoriesController {
  constructor(private readonly cultureStoriesService: CultureStoriesService) {}

  @Post()
  @Secured('articles.create')
  @ApiOperation({ summary: 'Create a culture story' })
  @ApiBody({ type: CreateCultureStoryDto })
  create(@Body() createDto: CreateCultureStoryDto) {
    return this.cultureStoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all culture stories' })
  @ApiQuery({ name: 'category', required: false, enum: ['quartier', 'académie', 'ultras', 'rivalité'] })
  findAll(@Query('category') category?: string) {
    return this.cultureStoriesService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a culture story by ID' })
  findOne(@Param('id') id: string) {
    return this.cultureStoriesService.findOne(id);
  }

  @Patch(':id')
  @Secured('articles.update')
  @ApiOperation({ summary: 'Update a culture story' })
  @ApiBody({ type: CreateCultureStoryDto, required: false })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateCultureStoryDto>) {
    return this.cultureStoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @Secured('articles.delete')
  @ApiOperation({ summary: 'Delete a culture story' })
  remove(@Param('id') id: string) {
    return this.cultureStoriesService.remove(id);
  }
}
