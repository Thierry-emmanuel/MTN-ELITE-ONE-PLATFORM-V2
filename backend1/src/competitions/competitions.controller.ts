import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, HttpCode, HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly svc: CompetitionsService) {}

  // ── Public reads ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all competitions' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get competition with its seasons' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  // ── Admin-only writes ─────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a competition (admin only)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Name already exists' })
  create(@Body() dto: CreateCompetitionDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update competition (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompetitionDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete competition (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
