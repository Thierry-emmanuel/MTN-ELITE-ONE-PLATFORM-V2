import { Module } from '@nestjs/common';
import { TypeOrmModule }     from '@nestjs/typeorm';
import { Player }            from './player.entity';
import { PlayerStats }       from './player-stats.entity';
import { PlayersService }    from './players.service';
import { PlayersController } from './players.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerStats])],
  controllers: [PlayersController],
  providers:   [PlayersService],
  exports:     [PlayersService, TypeOrmModule],
})
export class PlayersModule {}