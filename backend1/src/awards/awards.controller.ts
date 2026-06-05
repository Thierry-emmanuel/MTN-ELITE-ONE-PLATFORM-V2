import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AwardsService } from './awards.service';
import { VoteDto } from './dto/vote.dto';
import { Request } from 'express';

@ApiTags('awards')
@Controller('awards')
export class AwardsController {
  constructor(private readonly awardsService: AwardsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active awards with nominations' })
  findAllActive() {
    return this.awardsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get award details by ID' })
  findOne(@Param('id') id: string) {
    return this.awardsService.findOne(id);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote for an award nomination' })
  vote(@Param('id') id: string, @Body() dto: VoteDto, @Req() req: Request) {
    // Extract IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // User ID is extracted if user is authenticated (Optional)
    const userId = (req as any).user?.id;
    return this.awardsService.vote(id, dto, ipAddress as string, userId);
  }
}
