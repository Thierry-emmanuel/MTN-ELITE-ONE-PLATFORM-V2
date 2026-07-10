import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — apply with @UseGuards(JwtAuthGuard) on any controller or route
 * that requires a valid Bearer token. Throws 401 if token is missing or invalid.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
