import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStaffTable1784202000000 implements MigrationInterface {
    name = 'CreateStaffTable1784202000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."staff_role_enum" AS ENUM(
                'HEAD_COACH', 'ASSISTANT_COACH', 'GOALKEEPER_COACH', 'FITNESS_COACH',
                'PHYSIO', 'DOCTOR', 'ANALYST', 'SCOUT',
                'KIT_MAN', 'MEDIA_OFFICER', 'SECRETARY', 'TEAM_MANAGER'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."staff_status_enum" AS ENUM('ACTIVE', 'INACTIVE')
        `);
        await queryRunner.query(`
            CREATE TABLE "staff" (
                "id"             SERIAL                          NOT NULL,
                "first_name"     character varying(100)          NOT NULL,
                "last_name"      character varying(100)          NOT NULL,
                "nationality"    character varying(100),
                "birth_date"     date,
                "role"           "public"."staff_role_enum"      NOT NULL DEFAULT 'ASSISTANT_COACH',
                "club_id"        integer,
                "contract_start" date,
                "contract_end"   date,
                "photo_url"      character varying(500),
                "status"         "public"."staff_status_enum"    NOT NULL DEFAULT 'ACTIVE',
                "bio"            text,
                "created_at"     TIMESTAMP                       NOT NULL DEFAULT now(),
                "updated_at"     TIMESTAMP                       NOT NULL DEFAULT now(),
                CONSTRAINT "PK_staff" PRIMARY KEY ("id"),
                CONSTRAINT "FK_staff_club"
                    FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_staff_club" ON "staff" ("club_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_staff_club"`);
        await queryRunner.query(`DROP TABLE "staff"`);
        await queryRunner.query(`DROP TYPE "public"."staff_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."staff_role_enum"`);
    }
}
