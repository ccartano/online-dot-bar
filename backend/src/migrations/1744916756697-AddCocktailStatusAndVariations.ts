import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCocktailStatusAndVariations1744916756697 implements MigrationInterface {
  name = 'AddCocktailStatusAndVariations1744916756697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add status enum type
    await queryRunner.query(
      `CREATE TYPE "public"."cocktail_status_enum" AS ENUM('active', 'pending')`,
    );

    // Add status column with default 'active'
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD COLUMN "status" "public"."cocktail_status_enum" NOT NULL DEFAULT 'active'`,
    );

    // Add parentId column
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD COLUMN "parentId" integer`,
    );

    // Add foreign key constraint for parentId
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD CONSTRAINT "FK_cocktail_parent" FOREIGN KEY ("parentId") REFERENCES "cocktail"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP CONSTRAINT "FK_cocktail_parent"`,
    );

    // Remove columns
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP COLUMN "parentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP COLUMN "status"`,
    );

    // Remove enum type
    await queryRunner.query(
      `DROP TYPE "public"."cocktail_status_enum"`,
    );
  }
} 