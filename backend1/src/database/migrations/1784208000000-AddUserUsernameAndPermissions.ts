import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserUsernameAndPermissions1784208000000 implements MigrationInterface {
    name = 'AddUserUsernameAndPermissions1784208000000';

    public async up(q: QueryRunner): Promise<void> {
        await q.query(`ALTER TABLE "users" ADD COLUMN "username" varchar(120)`);
        await q.query(`ALTER TABLE "users" ADD COLUMN "permissions" jsonb NOT NULL DEFAULT '[]'`);
        await q.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")`);
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_username"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "permissions"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }
}
