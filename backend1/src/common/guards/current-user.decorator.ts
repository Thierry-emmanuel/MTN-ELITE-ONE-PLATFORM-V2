import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() — extracts req.user populated by JwtStrategy.validate().
 * Usage: method(@CurrentUser() user: { id: number; email: string; role: UserRole })
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<{ user: unknown }>().user,
);
