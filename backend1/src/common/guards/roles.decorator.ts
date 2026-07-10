import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

export const ROLES_KEY = 'roles';

/**
 * @Roles(UserRole.ADMIN, UserRole.EDITOR)
 * Attach allowed roles to a controller or route handler.
 * Must be paired with @UseGuards(JwtAuthGuard, RolesGuard).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
