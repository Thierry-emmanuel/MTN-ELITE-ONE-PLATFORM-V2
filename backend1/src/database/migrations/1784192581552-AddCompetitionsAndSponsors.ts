import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompetitionsAndSponsors1784192581552 implements MigrationInterface {
    name = 'AddCompetitionsAndSponsors1784192581552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sponsors_tier_enum" AS ENUM('TITLE', 'GOLD', 'SILVER', 'PARTNER')`);
        await queryRunner.query(`CREATE TABLE "sponsors" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "logo_url" character varying(500), "tier" "public"."sponsors_tier_enum" NOT NULL DEFAULT 'PARTNER', "website_url" character varying(255), "contact_email" character varying(150), "contract_start" date, "contract_end" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e0107b9d2bcde30242b06fdecab" UNIQUE ("name"), CONSTRAINT "PK_6d1114fe7e65855154351b66bfc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sponsor_placements_placementtype_enum" AS ENUM('HERO_BANNER', 'AWARD_CATEGORY', 'MATCH_CENTER', 'CLUB_PAGE')`);
        await queryRunner.query(`CREATE TABLE "sponsor_placements" ("id" SERIAL NOT NULL, "sponsor_id" integer NOT NULL, "placementType" "public"."sponsor_placements_placementtype_enum" NOT NULL DEFAULT 'HERO_BANNER', "target_id" integer, "active" boolean NOT NULL DEFAULT true, "priority" integer NOT NULL DEFAULT '0', "starts_at" TIMESTAMP WITH TIME ZONE, "ends_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d8f4692b5825db87a8ecd39f7b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competitions_type_enum" AS ENUM('LEAGUE', 'CUP', 'QUALIFIER')`);
        await queryRunner.query(`CREATE TABLE "competitions" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "type" "public"."competitions_type_enum" NOT NULL DEFAULT 'LEAGUE', "country" character varying(5) NOT NULL DEFAULT 'CM', "tier" integer NOT NULL DEFAULT '1', "logo_url" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b88bf405e9d480052de287ac58" UNIQUE ("name"), CONSTRAINT "PK_ef273910798c3a542b475e75c7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "seasons" ADD "competition_id" integer`);
        await queryRunner.query(`ALTER TABLE "seasons" ADD CONSTRAINT "FK_47b4c52ec141bc0ef8b7106777e" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsor_placements" ADD CONSTRAINT "FK_af7d43cbd1b8f1009c8b05645fa" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        // Backfill: Create MTN Elite One competition
        await queryRunner.query(`INSERT INTO "competitions" ("name", "type", "country", "tier") VALUES ('MTN Elite One', 'LEAGUE', 'CM', 1)`);
        // Backfill: Attach all existing Season rows to it
        await queryRunner.query(`UPDATE "seasons" SET "competition_id" = (SELECT "id" FROM "competitions" WHERE "name" = 'MTN Elite One') WHERE "competition_id" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sponsor_placements" DROP CONSTRAINT "FK_af7d43cbd1b8f1009c8b05645fa"`);
        await queryRunner.query(`ALTER TABLE "seasons" DROP CONSTRAINT "FK_47b4c52ec141bc0ef8b7106777e"`);
        await queryRunner.query(`ALTER TABLE "seasons" DROP COLUMN "competition_id"`);
        await queryRunner.query(`DROP TABLE "competitions"`);
        await queryRunner.query(`DROP TYPE "public"."competitions_type_enum"`);
        await queryRunner.query(`DROP TABLE "sponsor_placements"`);
        await queryRunner.query(`DROP TYPE "public"."sponsor_placements_placementtype_enum"`);
        await queryRunner.query(`DROP TABLE "sponsors"`);
        await queryRunner.query(`DROP TYPE "public"."sponsors_tier_enum"`);
    }

}
