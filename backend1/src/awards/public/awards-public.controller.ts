import { Controller, Get, Post, Param, Body, Req, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { AwardsPublicService } from './awards-public.service';
import { PublicVoteDto } from '../dto/vote.dto';

/** Everything the gala Awards page (player/team/coach laureates, nominees,
 *  live votes, status) consumes. Kept separate from AwardsController so the
 *  admin CRUD surface (raw entities) never has to match the richer public
 *  DTO shape the frontend renders. */
@ApiTags('awards-public')
@Controller('awards/public')
export class AwardsPublicController {
  constructor(private readonly svc: AwardsPublicService) {}

  @Get()
  @ApiOperation({ summary: 'All awards, ready-to-render for the Awards page' })
  findAll(@Query('season') season?: string) {
    return this.svc.findAllPublic(season ? Number(season) : undefined);
  }

  @Get('team-of-week')
  @ApiOperation({ summary: 'Live-composed Team of the Week (best-rated XI)' })
  teamOfWeek() {
    return this.svc.getTeamOfWeek();
  }

  @Get('historical')
  @ApiOperation({ summary: "Past laureates, one entry per closed award" })
  historical(@Query('category') category?: string) {
    return this.svc.getHistorical(category);
  }

  @Get('ballon-dor')
  @ApiOperation({ summary: "Ballon d'Or live ranking" })
  ballonDor(@Query('year') year?: string) {
    return this.svc.getBallonDor(year ? Number(year) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single award, ready-to-render' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findPublicById(id);
  }

  @Get(':id/votes')
  @ApiOperation({ summary: 'Current vote tally for an award' })
  votes(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getVoteResults(id);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Ranked leaderboard with nominee names/photos' })
  leaderboard(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getLeaderboard(id);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Cast a public vote (one per award per IP/user)' })
  vote(@Param('id', ParseIntPipe) id: number, @Body() dto: PublicVoteDto, @Req() req: Request) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return this.svc.vote(id, dto.nomineeId, ipAddress as string, userId);
  }
}
