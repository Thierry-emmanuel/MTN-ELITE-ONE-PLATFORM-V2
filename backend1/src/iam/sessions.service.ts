import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { UserSession } from './entities/user-session.entity';

const REFRESH_TTL_DAYS = 30;

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * SessionsService — one row per login/device. The raw refresh token is
 * returned exactly once (at login / rotation); only its hash is stored.
 */
@Injectable()
export class SessionsService {
  constructor(@InjectRepository(UserSession) private readonly repo: Repository<UserSession>) {}

  /** Create a session at login. Returns the session and the RAW refresh token. */
  async open(userId: number, meta: { userAgent?: string; ip?: string }) {
    const raw = randomBytes(48).toString('hex');
    const session = await this.repo.save(this.repo.create({
      userId,
      refreshTokenHash: sha256(raw),
      userAgent: meta.userAgent?.slice(0, 400) ?? null,
      ip: meta.ip ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000),
      lastUsedAt: new Date(),
    }));
    return { session, refreshToken: raw };
  }

  /**
   * Validate + rotate a refresh token. The old token is retired by
   * replacing the hash (rotation), keeping the same session row so the
   * sid embedded in access tokens stays stable per device.
   */
  async rotate(rawRefreshToken: string) {
    const session = await this.repo.findOne({
      where: { refreshTokenHash: sha256(rawRefreshToken), revokedAt: IsNull() },
    });
    if (!session) throw new UnauthorizedException('Session invalide');
    if (session.expiresAt.getTime() < Date.now()) {
      await this.repo.update(session.id, { revokedAt: new Date() });
      throw new UnauthorizedException('Session expirée — reconnectez-vous');
    }
    const raw = randomBytes(48).toString('hex');
    session.refreshTokenHash = sha256(raw);
    session.lastUsedAt = new Date();
    session.expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000);
    await this.repo.save(session);
    return { session, refreshToken: raw };
  }

  /** Is this session still valid? (called by JwtStrategy via sid claim) */
  async isActive(sessionId: string): Promise<boolean> {
    const s = await this.repo.findOne({ where: { id: sessionId } });
    return !!s && !s.revokedAt && s.expiresAt.getTime() > Date.now();
  }

  listForUser(userId: number) {
    return this.repo.find({
      where: { userId, revokedAt: IsNull() },
      order: { lastUsedAt: 'DESC' },
    });
  }

  async revoke(sessionId: string, userId?: number) {
    const where: Record<string, unknown> = { id: sessionId };
    if (userId != null) where.userId = userId; // non-admins can only revoke their own
    const s = await this.repo.findOne({ where: where as never });
    if (!s) throw new UnauthorizedException('Session introuvable');
    s.revokedAt = new Date();
    await this.repo.save(s);
    return { message: 'Session révoquée' };
  }

  async revokeAll(userId: number, exceptSessionId?: string) {
    const qb = this.repo.createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId });
    if (exceptSessionId) qb.andWhere('id != :sid', { sid: exceptSessionId });
    const res = await qb.execute();
    return { message: 'Sessions révoquées', count: res.affected ?? 0 };
  }
}
