import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefereeToMatches1784193000000 implements MigrationInterface {
    name = 'AddRefereeToMatches1784193000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD "referee" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "referee"`);
    }
}
