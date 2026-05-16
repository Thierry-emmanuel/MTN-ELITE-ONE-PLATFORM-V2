import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { RegisterDto, RegisterEditorDto } from '../auth/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(dto: RegisterDto): Promise<Omit<User, 'password'>> {
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

  async createEditor(dto: RegisterEditorDto): Promise<Omit<User, 'password'>> {
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
      editorApproved:  false, // pending admin review
    });
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  // ── Helpers ──────────────────────────────────────────────────
  private async assertEmailFree(email: string) {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Cet email est déjà utilisé');
  }

  sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }
}