import {
  Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { CreateSponsorPlacementDto } from './dto/create-sponsor-placement.dto';
import { UpdateSponsorPlacementDto } from './dto/update-sponsor-placement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  // ── Sponsors Endpoints ─────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all sponsors' })
  findAllSponsors() {
    return this.service.findAllSponsors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sponsor by ID' })
  findOneSponsor(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSponsor(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sponsor (admin only)' })
  createSponsor(@Body() dto: CreateSponsorDto) {
    return this.service.createSponsor(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sponsor details (admin only)' })
  updateSponsor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorDto,
  ) {
    return this.service.updateSponsor(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete sponsor (admin only)' })
  removeSponsor(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSponsor(id);
  }

  // ── Sponsor Placements Endpoints ───────────────────────────────────────────

  @Get('placements/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all placements including inactive/expired (admin only)' })
  findAllPlacements() {
    return this.service.findAllPlacements();
  }

  @Get('placements/active')
  @ApiOperation({ summary: 'Get all active placements based on timeline rules' })
  findActivePlacements() {
    return this.service.findActivePlacements();
  }

  @Get('placements/:id')
  @ApiOperation({ summary: 'Get placement by ID' })
  findOnePlacement(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOnePlacement(id);
  }

  @Post('placements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sponsor placement (admin only)' })
  createPlacement(@Body() dto: CreateSponsorPlacementDto) {
    return this.service.createPlacement(dto);
  }

  @Patch('placements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sponsor placement details (admin only)' })
  updatePlacement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorPlacementDto,
  ) {
    return this.service.updatePlacement(id, dto);
  }

  @Delete('placements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete sponsor placement (admin only)' })
  removePlacement(@Param('id', ParseIntPipe) id: number) {
    return this.service.removePlacement(id);
  }
}
