import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Sprint 2 — Equipments backend module. Replaces the frontend localStorage
 * shim (the last placeholder implementation flagged by the ERP audit).
 */
export class Equipments1784207000000 implements MigrationInterface {
    name = 'Equipments1784207000000';

    public async up(q: QueryRunner): Promise<void> {
        await q.query(`CREATE TYPE "equipments_type_enum" AS ENUM
            ('JERSEY_HOME','JERSEY_AWAY','BALL','TRAINING_KIT','OTHER')`);
        await q.query(`
            CREATE TABLE "equipments" (
                "id"         SERIAL PRIMARY KEY,
                "name"       varchar(150) NOT NULL,
                "type"       "equipments_type_enum" NOT NULL DEFAULT 'OTHER',
                "brand"      varchar(100) NOT NULL,
                "club_id"    integer,
                "image_url"  varchar(500),
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now()
            )`);
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.query(`DROP TABLE "equipments"`);
        await q.query(`DROP TYPE "equipments_type_enum"`);
    }
}
