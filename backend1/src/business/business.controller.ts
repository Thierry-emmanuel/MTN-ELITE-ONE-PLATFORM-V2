import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '../users/user.entity';
import { BusinessService } from './business.service';
import { PaymentsService } from './payments.service';

const ADMIN = [JwtAuthGuard, RolesGuard] as const;

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(
    private readonly business: BusinessService,
    private readonly payments: PaymentsService,
  ) {}

  // ── payments (declared before :collection so the route wins) ─────────────
  @Get('payments')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  listPayments() { return this.payments.list(); }

  @Post('payments/initiate')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Record a payment intent; executes when a provider is plugged (501 until then)' })
  initiate(@Body() dto: any) { return this.payments.initiate(dto); }

  @Post('payments/:id/confirm')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  confirm(@Param('id') id: string, @Body() body: { outcome: 'CONFIRMED' | 'FAILED'; providerRef?: string }) {
    return this.payments.confirm(id, body.outcome, body.providerRef);
  }

  // ── generic business collections ─────────────────────────────────────────
  @Get(':collection')
  findAll(@Param('collection') collection: string, @Query() query: Record<string, unknown>) {
    return this.business.findAll(collection, query);
  }

  @Get(':collection/:id')
  findOne(@Param('collection') collection: string, @Param('id') id: string) {
    return this.business.findOne(collection, id);
  }

  @Post(':collection')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  create(@Param('collection') collection: string, @Body() payload: Record<string, unknown>) {
    return this.business.create(collection, payload);
  }

  @Patch(':collection/:id')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  update(@Param('collection') collection: string, @Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.business.update(collection, id, payload);
  }

  @Delete(':collection/:id')
  @ApiBearerAuth() @UseGuards(...ADMIN) @Roles(UserRole.ADMIN)
  remove(@Param('collection') collection: string, @Param('id') id: string) {
    return this.business.remove(collection, id);
  }
}
