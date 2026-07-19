import {
  CanActivate, ExecutionContext, ForbiddenException,
  Injectable, SetMetadata, UseGuards, applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesService } from '../roles.service';

export const PERMISSIONS_KEY = 'iam:permissions';

/** Shape of req.user after JwtStrategy.validate (see common/guards/jwt.strategy.ts). */
export interface RequestUser {
  id: number;
  email: string;
  role: string;          // legacy enum, kept for backward compatibility
  roleKeys: string[];    // IAM role keys (falls back to [role])
  sessionId?: string;
  /** set by PermissionsGuard when access was granted with ":own" scope only */
  ownershipRequired?: string;
}

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * PermissionsGuard — resolves the caller's effective permission set
 * (union of their IAM roles, with legacy enum fallback) and checks it
 * against the @RequirePermissions() metadata.
 *
 * ":own"-scoped grants pass the guard but tag the request with
 * `ownershipRequired`; the service must then call assertOwnership().
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roles: RolesService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true; // auth-only route

    const req = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = req.user;
    if (!user) throw new ForbiddenException('Accès refusé');

    const roleKeys = user.roleKeys?.length ? user.roleKeys : [user.role].filter(Boolean);

    for (const perm of required) {
      const verdict = await this.roles.can(roleKeys, perm);
      if (verdict === 'no')
        throw new ForbiddenException(`Permission requise: ${perm}`);
      if (verdict === 'own') user.ownershipRequired = perm;
    }
    return true;
  }
}

/**
 * @Secured('players.update') — one decorator = authentication + permission
 * check + Swagger bearer annotation. This is what hardens the previously
 * unguarded write endpoints without three lines of boilerplate each.
 */
export const Secured = (...permissions: string[]) =>
  applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions),
  );

/**
 * Ownership helper — call from services after loading the record when the
 * request may have been granted with ":own" scope:
 *
 *   assertOwnership(req.user, article.authorId);
 */
export function assertOwnership(user: RequestUser, ownerId: number | string | null | undefined) {
  if (!user.ownershipRequired) return; // full grant — nothing to verify
  if (ownerId == null || String(ownerId) !== String(user.id))
    throw new ForbiddenException(
      'Vous ne pouvez agir que sur vos propres enregistrements',
    );
}
