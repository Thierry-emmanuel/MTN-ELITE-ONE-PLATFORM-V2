import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus,
  UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { Roles }         from '../common/guards/roles.decorator';
import { AuditService }    from '../iam/audit.service';
import { SessionsService } from '../iam/sessions.service';

// All user-management endpoints are admin-only.
// Public registration is handled by /auth/register.
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
    private readonly sessions: SessionsService,
  ) {}

  // GET /users?page=1&limit=20&role=admin&search=john
  @Get()
  @ApiOperation({ summary: 'List all users with pagination and filters (admin)' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'role',   required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('role')   role?:   UserRole,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page:   page   ? Number(page)  : 1,
      limit:  limit  ? Number(limit) : 20,
      role,
      search,
    });
  }

  // GET /users/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // POST /users/admin-create
  @Post('admin-create')
  @ApiOperation({ summary: 'Admin creates a user directly (bypasses email verify)' })
  adminCreate(@Body() dto: any) {
    return this.usersService.adminCreate(dto);
  }

  // POST /users — REST alias of admin-create so the generic EntityCrudEngine
  // (which always POSTs to the collection root) can create users too.
  @Post()
  @ApiOperation({ summary: 'Create user (alias of admin-create for the IAM studio)' })
  createRest(@Body() dto: any) {
    return this.usersService.adminCreate(dto);
  }

  // PATCH /users/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile, role, or status' })
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.usersService.adminUpdate(id, dto);
  }

  // PATCH /users/:id/toggle-active
  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActive(id);
  }

  // ── IAM lifecycle (Sprint 1) ───────────────────────────────────
  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend a user (blocks login, keeps data)' })
  async suspend(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = await this.usersService.suspend(id);
    this.audit.log({ actorId: req.user?.id, actorEmail: req.user?.email, action: 'users.suspend', targetType: 'user', targetId: id, ip: req.ip });
    this.sessions.revokeAll(id).catch(() => { /* best-effort */ });
    return user;
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate (or reactivate) a user' })
  async activate(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = await this.usersService.activate(id);
    this.audit.log({ actorId: req.user?.id, actorEmail: req.user?.email, action: 'users.activate', targetType: 'user', targetId: id, ip: req.ip });
    return user;
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a user (soft removal — record retained)' })
  async archiveUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = await this.usersService.archiveUser(id);
    this.audit.log({ actorId: req.user?.id, actorEmail: req.user?.email, action: 'users.archive', targetType: 'user', targetId: id, ip: req.ip });
    this.sessions.revokeAll(id).catch(() => { /* best-effort */ });
    return user;
  }

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Assign IAM roles (replaces role_keys)' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleKeys') roleKeys: string[],
    @Req() req: any,
  ) {
    const user = await this.usersService.assignRoles(id, roleKeys ?? []);
    this.audit.log({ actorId: req.user?.id, actorEmail: req.user?.email, action: 'users.assign-roles', targetType: 'user', targetId: id, metadata: { roleKeys }, ip: req.ip });
    return user;
  }

  @Patch(':id/force-password-change')
  @ApiOperation({ summary: 'Require the user to change password at next login' })
  forcePasswordChange(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.forcePasswordChange(id, true);
  }

  @Get(':id/login-history')
  @ApiOperation({ summary: 'Login/logout history from the audit trail' })
  loginHistory(@Param('id', ParseIntPipe) id: number, @Query('limit') limit?: string) {
    return this.audit.loginHistory(id, limit ? Number(limit) : 50);
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Active sessions (devices) of a user' })
  userSessions(@Param('id', ParseIntPipe) id: number) {
    return this.sessions.listForUser(id);
  }

  // PATCH /users/:id/approve-editor
  @Patch(':id/approve-editor')
  @ApiOperation({ summary: 'Approve an editor account' })
  approveEditor(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.approveEditor(id);
  }

  // PATCH /users/:id/reset-password
  @Patch(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password (admin action)' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user account (admin only, cannot delete admins)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.adminRemove(id);
  }
}
