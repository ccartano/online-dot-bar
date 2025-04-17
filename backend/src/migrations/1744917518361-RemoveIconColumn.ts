import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIconColumn1744917518361 implements MigrationInterface {
    name = 'RemoveIconColumn1744917518361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "glass_type" DROP COLUMN "icon"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "glass_type" ADD "icon" character varying`);
    }

}
