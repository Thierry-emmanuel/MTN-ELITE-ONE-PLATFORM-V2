import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { WorkflowService, WorkflowStatus } from './workflow.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { RequestUser } from '../iam/guards/permissions.guard';
import { RolesService } from '../iam/roles.service';

type AuthedRequest = Request & { user: RequestUser };

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly rolesService: RolesService,
  ) {}

  @Post(':entity/:id/transition')
  async transition(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Body('to') to: string,
    @Req() req: AuthedRequest,
  ) {
    const roleKeys = req.user.roleKeys?.length ? req.user.roleKeys : [req.user.role].filter(Boolean);
    const { permissions } = await this.rolesService.resolve(roleKeys);

    return this.workflowService.transition(entity, id, to as WorkflowStatus, req.user, permissions);
  }
}
