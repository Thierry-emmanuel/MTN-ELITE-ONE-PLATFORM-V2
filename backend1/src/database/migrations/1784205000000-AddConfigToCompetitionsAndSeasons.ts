import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Phase 5 — Configuration Builders. Competitions and seasons gain a single
 * `config` JSONB column: the persisted home of every OS-level setting
 * (branding, format, regulations, calendar, match rules, finances,
 * automation…). JSONB keeps the surface extensible without a migration per
 * setting, while the READERS (standings engine, match engine, public site)
 * normalize with explicit defaults.
 */
export class AddConfigToCompetitionsAndSeasons1784205000000 implements MigrationInterface {
    name = 'AddConfigToCompetitionsAndSeasons1784205000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competitions" ADD COLUMN "config" jsonb NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "seasons"      ADD COLUMN "config" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competitions" DROP COLUMN "config"`);
        await queryRunner.query(`ALTER TABLE "seasons"      DROP COLUMN "config"`);
    }
}
