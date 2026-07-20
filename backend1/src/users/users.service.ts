import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

export interface CreateUserAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserAdminDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  editorApproved?: boolean;
  // IAM (Sprint 1)
  roleKeys?: string[];
  organizationId?: string | null;
  // Editor fields
  agency?: string;
  cniNumber?: string;
  mediaType?: string;
  purpose?: string;
  pressCardNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ── Read ──────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findAll(opts: {
    page?: number; limit?: number; role?: UserRole; search?: string;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page  = opts.page  ?? 1;
    const limit = opts.limit ?? 20;
    const where: any = {};
    if (opts.role) where.role = opts.role;
    if (opts.search) {
      // Run three un-paginated queries then merge+deduplicate in memory,
      // THEN apply pagination — this gives a correct `total` count.
      const [byEmail, byFirst, byLast] = await Promise.all([
        this.usersRepo.find({ where: { email:     ILike(`%${opts.search}%`) } }),
        this.usersRepo.find({ where: { firstName: ILike(`%${opts.search}%`) } }),
        this.usersRepo.find({ where: { lastName:  ILike(`%${opts.search}%`) } }),
      ]);
      const combined = [...byEmail, ...byFirst, ...byLast];
      const unique   = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const total    = unique.length;
      const slice    = unique.slice((page - 1) * limit, page * limit);
      return { data: slice.map(u => this.sanitize(u)), total, page, limit };
    }
    const [data, total] = await this.usersRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: data.map(u => this.sanitize(u)), total, page, limit };
  }

  // ── Create ────────────────────────────────────────────────────
  async createUser(dto: any): Promise<Omit<User, 'password'>> {
    await this.assertEmailFree(dto.email);
    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email:     dto.email,
      password:  hash,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      phone:     dto.phone,
      role:      UserRole.USER,
    });
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  async createEditor(dto: any): Promise<Omit<User, 'password'>> {
    await this.assertEmailFree(dto.email);
    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email:           dto.email,
      password:        hash,
      firstName:       dto.firstName,
      lastName:        dto.lastName,
      phone:           dto.phone,
      role:            UserRole.EDITOR,
      cniNumber:       dto.cniNumber,
      agency:          dto.agency,
      mediaType:       dto.mediaType,
      purpose:         dto.purpose,
      pressCardNumber: dto.pressCardNumber,
      editorApproved:  false,
    });
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  async adminCreate(dto: CreateUserAdminDto): Promise<Omit<User, 'password'>> {
    await this.assertEmailFree(dto.email);
    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email:     dto.email,
      password:  hash,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      phone:     dto.phone,
      role:      dto.role,
      isVerified: true, // admin-created users start verified
    });
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  // ── Update ────────────────────────────────────────────────────
  async adminUpdate(id: number, dto: UpdateUserAdminDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  async resetPassword(id: number, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    if (newPassword.length < 8) throw new BadRequestException('Minimum 8 caractères');
    user.password = await bcrypt.hash(newPassword, 12);
    // Admin-issued password → the user must choose their own at next login.
    user.mustChangePassword = true;
    await this.usersRepo.save(user);
    return { message: 'Mot de passe réinitialisé — changement obligatoire à la prochaine connexion' };
  }

  /** Self-service password change (also clears the forced-change flag). */
  async changeOwnPassword(id: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Mot de passe actuel incorrect');
    if (newPassword.length < 8) throw new BadRequestException('Minimum 8 caractères');
    user.password = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;
    await this.usersRepo.save(user);
    return { message: 'Mot de passe modifié' };
  }

  /** Toggle the forced-password-change flag without touching the password. */
  async forcePasswordChange(id: number, value = true): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    user.mustChangePassword = value;
    return this.sanitize(await this.usersRepo.save(user));
  }

  // ── IAM lifecycle (Sprint 1) ──────────────────────────────────
  private async setStatus(id: number, status: User['status']): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    user.status = status;
    user.isActive = status === 'active'; // keep the legacy flag coherent
    return this.sanitize(await this.usersRepo.save(user));
  }

  suspend(id: number)  { return this.setStatus(id, 'suspended'); }
  activate(id: number) { return this.setStatus(id, 'active'); }
  archiveUser(id: number)  { return this.setStatus(id, 'archived'); }

  /** Replace a user's IAM role keys (Role Builder assignment). */
  async assignRoles(id: number, roleKeys: string[]): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    user.roleKeys = [...new Set(roleKeys)];
    return this.sanitize(await this.usersRepo.save(user));
  }

  async toggleActive(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    user.isActive = !user.isActive;
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  async approveEditor(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    if (user.role !== UserRole.EDITOR) throw new BadRequestException('Cet utilisateur n\'est pas un éditeur');
    user.editorApproved = true;
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  // ── Delete ────────────────────────────────────────────────────
  async adminRemove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);
    if (user.role === UserRole.ADMIN) throw new BadRequestException('Impossible de supprimer un administrateur');
    await this.usersRepo.remove(user);
    return { message: `Compte de ${user.firstName} ${user.lastName} supprimé` };
  }

  // ── Helpers ──────────────────────────────────────────────────
  /** Non-critical — called fire-and-forget on every successful login. */
  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepo.update(id, { lastLoginAt: new Date() });
  }

  // ── Internal ─────────────────────────────────────────────────
  private async assertEmailFree(email: string) {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Cet email est déjà utilisé');
  }

  sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }

  async updateMfaSecret(id: number, secret: string): Promise<void> {
    await this.usersRepo.update(id, { mfaSecret: secret });
  }

  async enableMfa(id: number): Promise<void> {
    await this.usersRepo.update(id, { mfaEnabled: true });
  }

  async disableMfa(id: number): Promise<void> {
    await this.usersRepo.update(id, { mfaEnabled: false, mfaSecret: null });
  }
}