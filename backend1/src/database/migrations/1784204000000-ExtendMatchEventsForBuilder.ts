import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Phase 3 — Match Builder.
 * 1. New operational event types (INJURY, VAR, KICKOFF, HALF_TIME, FULL_TIME).
 * 2. player_id / club_id become nullable: control events (kickoff, half-time,
 *    full-time) have no actor. Requires PostgreSQL ≥ 12 (ALTER TYPE ... ADD
 *    VALUE inside a transaction).
 */
export class ExtendMatchEventsForBuilder1784204000000 implements MigrationInterface {
    name = 'ExtendMatchEventsForBuilder1784204000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const v of ['INJURY', 'VAR', 'KICKOFF', 'HALF_TIME', 'FULL_TIME']) {
            await queryRunner.query(
                `ALTER TYPE "public"."match_events_type_enum" ADD VALUE IF NOT EXISTS '${v}'`,
            );
        }
        await queryRunner.query(`ALTER TABLE "match_events" ALTER COLUMN "player_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "match_events" ALTER COLUMN "club_id"   DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Postgres cannot drop enum values; restoring NOT NULL is the only reversal.
        await queryRunner.query(`DELETE FROM "match_events" WHERE "player_id" IS NULL OR "club_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "match_events" ALTER COLUMN "player_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "match_events" ALTER COLUMN "club_id"   SET NOT NULL`);
    }
}
