import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HomepageLayoutService } from './homepage-layout.service';

@ApiTags('homepage-layout')
@Controller('homepage-layout')
export class HomepageLayoutController {
  constructor(private readonly layoutService: HomepageLayoutService) {}

  @Get()
  @ApiOperation({ summary: 'Get current home page layout' })
  getLayout() {
    return this.layoutService.getLayout();
  }

  @Post()
  @ApiOperation({ summary: 'Update home page layout structure' })
  updateLayout(
    @Body() body: { section_order: string[]; section_visibility: Record<string, boolean> },
  ) {
    return this.layoutService.updateLayout(body.section_order, body.section_visibility);
  }
}
