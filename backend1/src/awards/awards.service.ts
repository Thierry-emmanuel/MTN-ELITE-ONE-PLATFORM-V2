import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Award, AwardStatus } from './entities/award.entity';
import { AwardNomination } from './entities/award-nomination.entity';
import { Vote } from './entities/vote.entity';
import { VoteDto } from './dto/vote.dto';
import * as crypto from 'crypto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AwardsService {
  constructor(
    @InjectRepository(Award) private awardRepo: Repository<Award>,
    @InjectRepository(AwardNomination) private nominationRepo: Repository<AwardNomination>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    private dataSource: DataSource,
    private wsGateway: WebsocketGateway,
  ) {}

  async findAll() {
    return this.awardRepo.find({
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive() {
    return this.awardRepo.find({
      where: { status: AwardStatus.OPEN },
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
    });
  }

  async findOne(id: number) {
    const award = await this.awardRepo.findOne({
      where: { id },
      relations: ['nominations', 'nominations.player', 'nominations.player.club'],
    });
    if (!award) throw new NotFoundException('Award not found');
    return award;
  }

  async create(dto: any): Promise<Award> {
    const award = this.awardRepo.create({
      category: dto.category,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      status: dto.status,
      seasonId: dto.seasonId,
      winnerId: dto.winnerId || null,
    });
    return this.awardRepo.save(award);
  }

  async update(id: number, dto: any): Promise<Award> {
    const award = await this.findOne(id);
    if (dto.category !== undefined) award.category = dto.category;
    if (dto.periodStart !== undefined) award.periodStart = new Date(dto.periodStart);
    if (dto.periodEnd !== undefined) award.periodEnd = new Date(dto.periodEnd);
    if (dto.status !== undefined) award.status = dto.status;
    if (dto.seasonId !== undefined) award.seasonId = dto.seasonId;
    if (dto.winnerId !== undefined) award.winnerId = dto.winnerId || null;
    return this.awardRepo.save(award);
  }

  async remove(id: number): Promise<void> {
    const award = await this.findOne(id);
    await this.awardRepo.remove(award);
  }

  async addNomination(awardId: number, playerId: number): Promise<AwardNomination> {
    const award = await this.findOne(awardId);
    
    // Check if nomination already exists
    const existing = await this.nominationRepo.findOne({ where: { awardId, playerId } });
    if (existing) throw new BadRequestException('Player is already nominated for this award');

    const nomination = this.nominationRepo.create({
      awardId,
      playerId,
      voteCount: 0,
    });
    return this.nominationRepo.save(nomination);
  }

  async removeNomination(awardId: number, nominationId: number): Promise<void> {
    const nomination = await this.nominationRepo.findOne({ where: { id: nominationId, awardId } });
    if (!nomination) throw new NotFoundException('Nomination not found');
    await this.nominationRepo.remove(nomination);
  }

  async vote(awardId: number, dto: VoteDto, ipAddress: string, userId?: number) {
    const award = await this.findOne(awardId);
    if (award.status !== AwardStatus.OPEN) {
      throw new BadRequestException('Voting is closed for this award');
    }

    const nomination = await this.nominationRepo.findOne({
      where: { id: dto.nominationId, awardId },
    });
    if (!nomination) throw new NotFoundException('Nomination not found for this award');

    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

    // Anti-fraud: Check if already voted
    const existingVote = await this.voteRepo.findOne({
      where: [{ ipHash, awardId }, ...(userId ? [{ userId, awardId }] : [])],
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted for this award');
    }

    // Transaction to save vote and update count safely
    await this.dataSource.transaction(async (manager) => {
      const vote = manager.create(Vote, {
        awardId,
        nominationId: dto.nominationId,
        userId: userId || null,
        ipHash,
      });
      await manager.save(vote);

      await manager.increment(AwardNomination, { id: dto.nominationId }, 'voteCount', 1);
    });

    // Fetch updated nomination for WS
    const updatedNomination = await this.nominationRepo.findOne({ where: { id: dto.nominationId } });

    // Emit realtime update
    this.wsGateway.server.emit('vote_updated', {
      awardId,
      nominationId: dto.nominationId,
      voteCount: updatedNomination?.voteCount,
    });

    return { message: 'Vote registered successfully' };
  }
}
