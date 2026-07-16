import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefereesTable1784201000000 implements MigrationInterface {
    name = 'CreateRefereesTable1784201000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."referees_license_level_enum" AS ENUM('NATIONAL', 'CAF', 'FIFA')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."referees_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'RETIRED')
        `);
        await queryRunner.query(`
            CREATE TABLE "referees" (
                "id"              SERIAL                                  NOT NULL,
                "first_name"      character varying(100)                  NOT NULL,
                "last_name"       character varying(100)                  NOT NULL,
                "nationality"     character varying(100)                  NOT NULL,
                "birth_date"      date,
                "birth_place"     character varying(150),
                "license_level"   "public"."referees_license_level_enum"  NOT NULL DEFAULT 'NATIONAL',
                "license_number"  character varying(50),
                "years_active"    integer,
                "phone_number"    character varying(30),
                "email"           character varying(150),
                "city"            character varying(150),
                "photo_url"       character varying(500),
                "status"          "public"."referees_status_enum"         NOT NULL DEFAULT 'ACTIVE',
                "notes"           text,
                "created_at"      TIMESTAMP                               NOT NULL DEFAULT now(),
                "updated_at"      TIMESTAMP                               NOT NULL DEFAULT now(),
                CONSTRAINT "PK_referees" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "referees"`);
        await queryRunner.query(`DROP TYPE "public"."referees_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."referees_license_level_enum"`);
    }
}
