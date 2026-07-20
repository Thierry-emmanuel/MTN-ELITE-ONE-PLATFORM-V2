import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum EquipmentType {
  JERSEY_HOME  = 'JERSEY_HOME',
  JERSEY_AWAY  = 'JERSEY_AWAY',
  BALL         = 'BALL',
  TRAINING_KIT = 'TRAINING_KIT',
  OTHER        = 'OTHER',
}

/**
 * Equipment — official league equipment (kits, balls, training gear).
 * Sprint 2: replaces the frontend localStorage shim that stood in for this
 * module since the Equipments builder shipped (the last placeholder flagged
 * by the ERP audit).
 */
@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'enum', enum: EquipmentType, default: EquipmentType.OTHER })
  type: EquipmentType;

  @Column({ length: 100 })
  brand: string;

  /** optional link to a club (league-wide gear when null) */
  @Column({ name: 'club_id', type: 'int', nullable: true })
  clubId: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
