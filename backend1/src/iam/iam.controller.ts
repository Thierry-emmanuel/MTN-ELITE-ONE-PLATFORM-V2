import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RolesService } from './roles.service';
import { OrganizationsService } from './organizations.service';
import { SessionsService } from './sessions.service';
import { AuditService } from './audit.service';
import { IamConfigService } from './iam-config.service';
import { PERMISSION_CATALOG, IAM_ACTIONS } from './permission.catalog';
import { Secured, type RequestUser } from './guards/permissions.guard';
import type { Role } from './entities/role.entity';
import type { Organization } from './entities/organization.entity';

type AuthedRequest = Request & { user: RequestUser };

@ApiTags('iam')
@Controller('iam')
export class IamController {
  constructor(
    private readonly roles: RolesService,
    private readonly organizations: OrganizationsService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
    private readonly config: IamConfigService,
  ) {}

  // ── Permission catalog ─────────────────────────────────────────
  @Get('permissions/catalog')
  @Secured('roles.view')
  @ApiOperation({ summary: 'Modules × actions catalog for the Role Builder matrix' })
  catalog() {
    return { actions: IAM_ACTIONS, modules: PERMISSION_CATALOG };
  }

  // ── Roles ──────────────────────────────────────────────────────
  @Get('roles')
  @Secured('roles.view')
  listRoles(@Query('includeArchived') includeArchived?: string) {
    return this.roles.findAll(includeArchived === 'true');
  }

  @Get('roles/:key')
  @Secured('roles.view')
  getRole(@Param('key') key: string) {
    return this.roles.findByKey(key);
  }

  @Post('roles')
  @Secured('roles.create')
  async createRole(@Body() dto: Partial<Role>, @Req() req: AuthedRequest) {
    const role = await this.roles.create(dto);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'roles.create', targetType: 'role', targetId: role.key, ip: req.ip });
    return role;
  }

  @Patch('roles/:key')
  @Secured('roles.update')
  async updateRole(@Param('key') key: string, @Body() dto: Partial<Role>, @Req() req: AuthedRequest) {
    const role = await this.roles.update(key, dto);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'roles.update', targetType: 'role', targetId: key, metadata: { version: role.version }, ip: req.ip });
    return role;
  }

  @Post('roles/:key/clone')
  @Secured('roles.create')
  async cloneRole(
    @Param('key') key: string,
    @Body() body: { key: string; name?: string },
    @Req() req: AuthedRequest,
  ) {
    const role = await this.roles.clone(key, body.key, body.name);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'roles.clone', targetType: 'role', targetId: role.key, metadata: { from: key }, ip: req.ip });
    return role;
  }

  @Post('roles/:key/archive')
  @Secured('roles.archive')
  async archiveRole(@Param('key') key: string, @Req() req: AuthedRequest) {
    const role = await this.roles.archive(key);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'roles.archive', targetType: 'role', targetId: key, ip: req.ip });
    return role;
  }

  @Post('roles/:key/restore')
  @Secured('roles.archive')
  restoreRole(@Param('key') key: string) {
    return this.roles.restore(key);
  }

  @Delete('roles/:key')
  @Secured('roles.delete')
  async deleteRole(@Param('key') key: string, @Req() req: AuthedRequest) {
    const res = await this.roles.remove(key);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'roles.delete', targetType: 'role', targetId: key, ip: req.ip });
    return res;
  }

  // ── Organizations ──────────────────────────────────────────────
  @Get('organizations')
  @Secured('organizations.view')
  listOrgs(@Query('includeArchived') includeArchived?: string) {
    return this.organizations.findAll(includeArchived === 'true');
  }

  @Get('organizations/tree')
  @Secured('organizations.view')
  orgTree() {
    return this.organizations.tree();
  }

  @Get('organizations/:id')
  @Secured('organizations.view')
  getOrg(@Param('id') id: string) {
    return this.organizations.findOne(id);
  }

  @Post('organizations')
  @Secured('organizations.create')
  async createOrg(@Body() dto: Partial<Organization>, @Req() req: AuthedRequest) {
    const org = await this.organizations.create(dto);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'organizations.create', targetType: 'organization', targetId: org.id, ip: req.ip });
    return org;
  }

  @Patch('organizations/:id')
  @Secured('organizations.update')
  updateOrg(@Param('id') id: string, @Body() dto: Partial<Organization>) {
    return this.organizations.update(id, dto);
  }

  @Post('organizations/:id/archive')
  @Secured('organizations.archive')
  archiveOrg(@Param('id') id: string) {
    return this.organizations.archive(id);
  }

  @Delete('organizations/:id')
  @Secured('organizations.delete')
  deleteOrg(@Param('id') id: string) {
    return this.organizations.remove(id);
  }

  // ── Sessions (self-service + admin) ────────────────────────────
  @Get('sessions/me')
  @Secured() // auth-only
  mySessions(@Req() req: AuthedRequest) {
    return this.sessions.listForUser(req.user.id);
  }

  @Delete('sessions/me/:id')
  @Secured()
  revokeMySession(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.sessions.revoke(id, req.user.id);
  }

  @Post('sessions/me/revoke-all')
  @Secured()
  async revokeAllMySessions(@Req() req: AuthedRequest) {
    const res = await this.sessions.revokeAll(req.user.id, req.user.sessionId);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'auth.logout-all', ip: req.ip });
    return res;
  }

  @Get('sessions/user/:userId')
  @Secured('sessions.view')
  userSessions(@Param('userId') userId: string) {
    return this.sessions.listForUser(Number(userId));
  }

  @Delete('sessions/:id')
  @Secured('sessions.delete')
  async adminRevokeSession(@Param('id') id: string, @Req() req: AuthedRequest) {
    const res = await this.sessions.revoke(id);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'sessions.revoke', targetType: 'session', targetId: id, ip: req.ip });
    return res;
  }

  // ── Audit logs ─────────────────────────────────────────────────
  @Get('audit')
  @Secured('audit.view')
  auditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.audit.find({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      actorId: actorId ? Number(actorId) : undefined,
      action, targetType, targetId, from, to,
    });
  }

  // ── Configuration store (menus, workspaces, flags) ─────────────
  @Get('config/:key')
  @Secured() // any authenticated user can READ config (sidebar needs it)
  getConfig(@Param('key') key: string) {
    return this.config.get(key);
  }

  @Put('config/:key')
  @Secured('settings.configure')
  async setConfig(
    @Param('key') key: string,
    @Body() value: Record<string, unknown>,
    @Req() req: AuthedRequest,
  ) {
    const res = await this.config.set(key, value, req.user.id);
    this.audit.log({ actorId: req.user.id, actorEmail: req.user.email, action: 'settings.configure', targetType: 'config', targetId: key, ip: req.ip });
    return res;
  }
}
