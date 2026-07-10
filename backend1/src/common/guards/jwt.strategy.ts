import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import type { JwtPayload } from '../../auth/auth.service';

/**
 * JwtStrategy validates the Bearer token on every guarded request.
 * It reads the secret from ConfigModule so it loads AFTER .env is parsed
 * (fixes the process.env read-at-parse-time bug in JwtModule.register()).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'change_me_in_production',
    });
  }

  /** Called after signature is verified. Returns value becomes `req.user`. */
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session invalide ou compte désactivé');
    }
    // Attach sanitized user + role to request object
    return { id: user.id, email: user.email, role: user.role };
  }
}
