import {
  Injectable, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RegisterEditorDto } from './auth.dto';
import { UserRole } from '../users/user.entity';

export interface JwtPayload {
  sub:   number;
  email: string;
  role:  UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService:   JwtService,
  ) {}

  // ── Login ──────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants incorrects');

    if (!user.isActive)
      throw new UnauthorizedException('Compte désactivé');

    const payload: JwtPayload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
    };

    // Update lastLoginAt (fire-and-forget — don't block the response)
    this.usersService.updateLastLogin(user.id).catch(() => { /* non-critical */ });

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.sanitize(user),
    };
  }

  // ── Register user ──────────────────────────────────────────
  async registerUser(dto: RegisterDto) {
    if (dto.role === UserRole.EDITOR)
      throw new BadRequestException(
        'Utilisez /auth/register/editor pour créer un compte éditeur',
      );
    const user = await this.usersService.createUser(dto);
    return { message: 'Compte créé avec succès', user };
  }

  // ── Register editor ────────────────────────────────────────
  async registerEditor(dto: RegisterEditorDto) {
    const user = await this.usersService.createEditor(dto);
    return {
      message:
        'Demande éditeur soumise. Votre compte sera activé après vérification.',
      user,
    };
  }
}