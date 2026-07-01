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
      // Search by email or name
      const [byEmail, byFirst, byLast] = await Promise.all([
        this.usersRepo.findAndCount({ where: { email:     ILike(`%${opts.search}%`) }, skip: (page - 1) * limit, take: limit }),
        this.usersRepo.findAndCount({ where: { firstName: ILike(`%${opts.search}%`) }, skip: (page - 1) * limit, take: limit }),
        this.usersRepo.findAndCount({ where: { lastName:  ILike(`%${opts.search}%`) }, skip: (page - 1) * limit, take: limit }),
      ]);
      const combined = [...byEmail[0], ...byFirst[0], ...byLast[0]];
      const unique   = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      return { data: unique.map(u => this.sanitize(u)), total: unique.length, page, limit };
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
    await this.usersRepo.save(user);
    return { message: 'Mot de passe réinitialisé avec succès' };
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
  // ── Internal ─────────────────────────────────────────────────
  private async assertEmailFree(email: string) {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Cet email est déjà utilisé');
  }

  sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }
}