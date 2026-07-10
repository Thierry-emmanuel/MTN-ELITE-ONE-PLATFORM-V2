import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Req, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AwardsService } from './awards.service';
import { VoteDto } from './dto/vote.dto';
import { CreateAwardDto, CreateNominationDto } from './dto/award-crud.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { Roles }        from '../common/guards/roles.decorator';
import { UserRole }     from '../users/user.entity';

@ApiTags('awards')
@Controller('awards')
export class AwardsController {
  constructor(private readonly awardsService: AwardsService) {}

  // ── Public read endpoints (no auth required) ─────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all awards' })
  findAll() {
    return this.awardsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active awards with nominations' })
  findAllActive() {
    return this.awardsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get award details by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.findOne(id);
  }

  // ── Vote — authenticated users only (any role) ───────────────────────────

  @Post(':id/vote')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Vote for an award nomination (authenticated)' })
  vote(@Param('id', ParseIntPipe) id: number, @Body() dto: VoteDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return this.awardsService.vote(id, dto, ipAddress, userId);
  }

  // ── Admin CRUD ────────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new award (admin)' })
  create(@Body() dto: CreateAwardDto) {
    return this.awardsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an award (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAwardDto>) {
    return this.awardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an award (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.remove(id);
  }

  @Post(':id/open')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Open the voting period for an award (admin)' })
  open(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.openAward(id);
  }

  @Post(':id/close')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Close voting and compute the winner (admin)' })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.closeAward(id);
  }

  @Post(':id/nominations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a nomination to an award (admin)' })
  addNomination(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateNominationDto) {
    return this.awardsService.addNomination(id, dto);
  }

  @Delete(':id/nominations/:nominationId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a nomination from an award (admin)' })
  removeNomination(
    @Param('id', ParseIntPipe) id: number,
    @Param('nominationId', ParseIntPipe) nominationId: number,
  ) {
    return this.awardsService.removeNomination(id, nominationId);
  }
}