import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';

@Entity('standings')
export class Standing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  played: number;

  @Column({ type: 'int', default: 0 })
  won: number;

  @Column({ type: 'int', default: 0 })
  drawn: number;

  @Column({ type: 'int', default: 0 })
  lost: number;

  @Column({ name: 'goals_for', type: 'int', default: 0 })
  goalsFor: number;

  @Column({ name: 'goals_against', type: 'int', default: 0 })
  goalsAgainst: number;

  @Column({ name: 'goal_difference', type: 'int', default: 0 })
  goalDifference: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ name: 'form_guide', length: 20, nullable: true })
  formGuide: string; // e.g. "WWDLW"

  @Column({ name: 'club_id' })
  clubId: string;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => Club, (club) => club.standings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Season, (season) => season.standings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;
}