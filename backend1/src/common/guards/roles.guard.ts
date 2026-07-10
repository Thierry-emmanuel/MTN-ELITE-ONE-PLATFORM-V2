import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user.entity';
import { ROLES_KEY } from './roles.decorator';

/**
 * RolesGuard — reads the @Roles() metadata and compares it against req.user.role.
 * Must be used AFTER JwtAuthGuard (which populates req.user).
 *
 * If no @Roles() metadata is set, the guard passes (authentication-only check).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // No @Roles() decorator → allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest<{ user: { role: UserRole } }>();
    if (!user) throw new ForbiddenException('Accès refusé');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Rôle requis: ${requiredRoles.join(' ou ')}. Votre rôle: ${user.role}`,
      );
    }

    return true;
  }
}
