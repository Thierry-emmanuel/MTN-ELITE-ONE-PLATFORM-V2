import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStadiumAndRefereeToMatches1784203000000 implements MigrationInterface {
    name = 'AddStadiumAndRefereeToMatches1784203000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add FK columns — nullable so existing rows are not affected
        await queryRunner.query(`
            ALTER TABLE "matches"
            ADD COLUMN "stadium_id" integer,
            ADD COLUMN "referee_id" integer
        `);
        // Foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "matches"
            ADD CONSTRAINT "FK_matches_stadium"
                FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_matches_referee"
                FOREIGN KEY ("referee_id") REFERENCES "referees"("id") ON DELETE SET NULL
        `);
        // Performance indexes
        await queryRunner.query(`CREATE INDEX "IDX_matches_stadium" ON "matches" ("stadium_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_matches_referee" ON "matches" ("referee_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_matches_referee"`);
        await queryRunner.query(`DROP INDEX "IDX_matches_stadium"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_matches_referee"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_matches_stadium"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "referee_id"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "stadium_id"`);
    }
}
