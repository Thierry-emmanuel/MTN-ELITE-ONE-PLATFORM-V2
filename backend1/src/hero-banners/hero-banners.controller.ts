import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HeroBannersService } from './hero-banners.service';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('hero-banners')
@Controller('hero-banners')
export class HeroBannersController {
  constructor(private readonly heroBannersService: HeroBannersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hero banner' })
  create(@Body() createHeroBannerDto: CreateHeroBannerDto) {
    return this.heroBannersService.create(createHeroBannerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active hero banners' })
  findAll() {
    return this.heroBannersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hero banner by ID' })
  findOne(@Param('id') id: string) {
    return this.heroBannersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hero banner by ID' })
  update(@Param('id') id: string, @Body() updateHeroBannerDto: UpdateHeroBannerDto) {
    return this.heroBannersService.update(id, updateHeroBannerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hero banner by ID' })
  remove(@Param('id') id: string) {
    return this.heroBannersService.remove(id);
  }
}
