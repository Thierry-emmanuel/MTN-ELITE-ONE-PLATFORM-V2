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

  async findAllActive() {
    return this.awardRepo.find({
      where: { status: AwardStatus.OPEN },
      relations: ['nominations', 'nominations.player'],
    });
  }

  async findOne(id: string) {
    const award = await this.awardRepo.findOne({
      where: { id },
      relations: ['nominations', 'nominations.player'],
    });
    if (!award) throw new NotFoundException('Award not found');
    return award;
  }

  async vote(awardId: string, dto: VoteDto, ipAddress: string, userId?: string) {
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
