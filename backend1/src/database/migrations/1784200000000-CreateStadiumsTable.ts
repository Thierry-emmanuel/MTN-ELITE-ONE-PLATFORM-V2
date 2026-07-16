import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStadiumsTable1784200000000 implements MigrationInterface {
    name = 'CreateStadiumsTable1784200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."stadiums_surface_enum" AS ENUM('GRASS', 'ARTIFICIAL', 'HYBRID')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."stadiums_status_enum" AS ENUM('ACTIVE', 'MAINTENANCE', 'CLOSED')
        `);
        await queryRunner.query(`
            CREATE TABLE "stadiums" (
                "id"          SERIAL                              NOT NULL,
                "name"        character varying(150)              NOT NULL,
                "city"        character varying(100)              NOT NULL,
                "country"     character varying(100)              NOT NULL DEFAULT 'Cameroun',
                "address"     character varying(200),
                "capacity"    integer,
                "surface"     "public"."stadiums_surface_enum"    NOT NULL DEFAULT 'GRASS',
                "opened_year" integer,
                "latitude"    double precision,
                "longitude"   double precision,
                "photo_url"   character varying(500),
                "banner_url"  character varying(500),
                "description" text,
                "status"      "public"."stadiums_status_enum"     NOT NULL DEFAULT 'ACTIVE',
                "created_at"  TIMESTAMP                           NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP                           NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_stadiums_name" UNIQUE ("name"),
                CONSTRAINT "PK_stadiums" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stadiums"`);
        await queryRunner.query(`DROP TYPE "public"."stadiums_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stadiums_surface_enum"`);
    }
}
