import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer } from './transfer.entity';
import { CreateTransferDto, UpdateTransferDto } from './dto/transfer.dto';
import { Player } from '../players/player.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer) private readonly repo: Repository<Transfer>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
  ) {}

  findAll(playerId?: number): Promise<Transfer[]> {
    return this.repo.find({
      where: playerId ? { playerId } : {},
      order: { transferDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Transfer> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Transfert introuvable');
    return t;
  }

  async create(dto: CreateTransferDto): Promise<Transfer> {
    const transfer = this.repo.create(dto as Partial<Transfer>);
    const saved = await this.repo.save(transfer);

    // Keep the squad list in sync: move the player to the destination club.
    if (dto.type === 'PERMANENT' || dto.type === 'FREE') {
      await this.players.update(dto.playerId, { clubId: dto.toClubId });
    }
    return saved;
  }

  async update(id: number, dto: UpdateTransferDto): Promise<Transfer> {
    await this.findOne(id);
    await this.repo.update(id, dto as Partial<Transfer>);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const t = await this.findOne(id);
    await this.repo.remove(t);
  }
}