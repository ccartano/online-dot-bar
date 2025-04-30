import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNameUniqueConstraint1744916756698 implements MigrationInterface {
  name = 'RemoveNameUniqueConstraint1744916756698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique constraint on the name column
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP CONSTRAINT IF EXISTS "UQ_3c44065317e8aad1dc6ecb8f7c3"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the unique constraint on the name column
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD CONSTRAINT "UQ_3c44065317e8aad1dc6ecb8f7c3" UNIQUE ("name")`
    );
  }
} 