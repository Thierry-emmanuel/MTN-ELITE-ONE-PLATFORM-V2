import {
  Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RegisterEditorDto } from './auth.dto';
import { User, UserRole } from '../users/user.entity';
import { SessionsService } from '../iam/sessions.service';
import { AuditService } from '../iam/audit.service';
import { RolesService } from '../iam/roles.service';
import { MfaService } from './mfa.service';

export interface JwtPayload {
  sub:   number;
  email: string;
  role:  UserRole;
  /** IAM role keys — union resolved by PermissionsGuard */
  rks?:  string[];
  /** session id — lets revocation invalidate refresh chains */
  sid?:  string;
}

export interface RequestMeta { userAgent?: string; ip?: string }

/**
 * AuthService — Sprint 1 upgrade.
 * Login now opens a UserSession (device row) and returns BOTH a short-lived
 * access token and a rotating refresh token. Legacy response fields
 * (accessToken, user) are preserved so existing clients keep working.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService:   JwtService,
    private readonly sessions:     SessionsService,
    private readonly audit:        AuditService,
    private readonly roles:        RolesService,
    private readonly mfaService:   MfaService,
  ) {}

  private signAccess(user: User, sessionId: string): string {
    const payload: JwtPayload = {
      sub: user.id, email: user.email, role: user.role,
      rks: user.roleKeys?.length ? user.roleKeys : [user.role],
      sid: sessionId,
    };
    return this.jwtService.sign(payload);
  }

  private assertLoginAllowed(user: User) {
    if (user.status === 'suspended' || !user.isActive)
      throw new UnauthorizedException('Compte suspendu');
    if (user.status === 'archived')
      throw new UnauthorizedException('Compte archivé');
  }

  // ── Login ──────────────────────────────────────────────────
  async login(dto: LoginDto, meta: RequestMeta = {}) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      this.audit.log({ actorEmail: dto.email, action: 'auth.login-failed', ip: meta.ip });
      throw new UnauthorizedException('Identifiants incorrects');
    }

    this.assertLoginAllowed(user);

    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, email: user.email };
      }
      const verified = this.mfaService.verifyCode(user.mfaSecret!, dto.mfaCode);
      if (!verified) {
        throw new UnauthorizedException('Code de validation 2FA invalide');
      }
    }

    const { session, refreshToken } = await this.sessions.open(user.id, meta);

    this.usersService.updateLastLogin(user.id).catch(() => { /* non-critical */ });
    this.audit.log({
      actorId: user.id, actorEmail: user.email, action: 'auth.login',
      metadata: { sessionId: session.id, userAgent: meta.userAgent }, ip: meta.ip,
    });

    return {
      accessToken: this.signAccess(user, session.id),
      refreshToken,
      mustChangePassword: user.mustChangePassword,
      user: this.usersService.sanitize(user),
    };
  }

  // ── Refresh (rotation) ─────────────────────────────────────
  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) throw new BadRequestException('refreshToken requis');
    const { session, refreshToken } = await this.sessions.rotate(rawRefreshToken);
    const user = await this.usersService.findById(session.userId);
    if (!user) throw new UnauthorizedException('Compte introuvable');
    this.assertLoginAllowed(user);
    return {
      accessToken: this.signAccess(user, session.id),
      refreshToken,
      user: this.usersService.sanitize(user),
    };
  }

  // ── Logout ─────────────────────────────────────────────────
  async logout(userId: number, email: string, sessionId: string | undefined, meta: RequestMeta = {}) {
    if (sessionId) await this.sessions.revoke(sessionId, userId).catch(() => undefined);
    this.audit.log({ actorId: userId, actorEmail: email, action: 'auth.logout', ip: meta.ip });
    return { message: 'Déconnecté' };
  }

  // ── Me (identity + effective permissions for the frontend) ──
  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Compte introuvable');
    const roleKeys = user.roleKeys?.length ? user.roleKeys : [user.role];
    const { permissions, fieldDeny } = await this.roles.resolve(roleKeys);
    return {
      user: this.usersService.sanitize(user),
      roleKeys,
      permissions,
      fieldDeny,
      mustChangePassword: user.mustChangePassword,
      mfaEnabled: user.mfaEnabled,
    };
  }

  // ── MFA Management ─────────────────────────────────────────
  async generateMfa(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Compte introuvable');
    const { secret, otpauthUrl } = this.mfaService.generateSecret(user.email);
    const qrDataUrl = await this.mfaService.generateQrCode(otpauthUrl);
    
    // Save secret temporarily but don't enable MFA yet
    await this.usersService.updateMfaSecret(userId, secret);
    return { secret, qrDataUrl };
  }

  async verifyAndEnableMfa(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Compte introuvable');
    if (!user.mfaSecret) throw new BadRequestException('MFA non configuré. Générez d\'abord un secret.');
    
    const verified = this.mfaService.verifyCode(user.mfaSecret, code);
    if (!verified) throw new BadRequestException('Code 2FA invalide.');

    await this.usersService.enableMfa(userId);
    return { message: 'MFA activé avec succès.' };
  }

  async disableMfa(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Compte introuvable');
    if (!user.mfaEnabled || !user.mfaSecret) throw new BadRequestException('MFA n\'est pas activé.');

    const verified = this.mfaService.verifyCode(user.mfaSecret, code);
    if (!verified) throw new BadRequestException('Code 2FA invalide.');

    await this.usersService.disableMfa(userId);
    return { message: 'MFA désactivé avec succès.' };
  }

  // ── Change own password ────────────────────────────────────
  async changePassword(userId: number, currentPassword: string, newPassword: string, meta: RequestMeta = {}) {
    const res = await this.usersService.changeOwnPassword(userId, currentPassword, newPassword);
    this.audit.log({ actorId: userId, action: 'auth.change-password', ip: meta.ip });
    return res;
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
