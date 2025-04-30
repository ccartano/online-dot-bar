import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCocktailStatusAndVariations1744916756697 implements MigrationInterface {
  name = 'AddCocktailStatusAndVariations1744916756697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if status column exists
    const statusColumnExists = await queryRunner.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'cocktail' 
       AND column_name = 'status'`
    );

    // Add status enum type if it doesn't exist
    if (!statusColumnExists.length) {
      await queryRunner.query(
        `DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cocktail_status_enum') THEN
            CREATE TYPE "public"."cocktail_status_enum" AS ENUM('active', 'pending');
          END IF;
        END $$;`
      );

      // Add status column with default 'active'
      await queryRunner.query(
        `ALTER TABLE "cocktail" ADD COLUMN "status" "public"."cocktail_status_enum" NOT NULL DEFAULT 'active'`
      );
    }

    // Check if parentId column exists
    const parentIdColumnExists = await queryRunner.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'cocktail' 
       AND column_name = 'parentId'`
    );

    // Add parentId column if it doesn't exist
    if (!parentIdColumnExists.length) {
      await queryRunner.query(
        `ALTER TABLE "cocktail" ADD COLUMN "parentId" integer`
      );

      // Add foreign key constraint for parentId
      await queryRunner.query(
        `ALTER TABLE "cocktail" ADD CONSTRAINT "FK_cocktail_parent" FOREIGN KEY ("parentId") REFERENCES "cocktail"("id") ON DELETE SET NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint if it exists
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP CONSTRAINT IF EXISTS "FK_cocktail_parent"`
    );

    // Remove columns if they exist
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP COLUMN IF EXISTS "parentId"`
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP COLUMN IF EXISTS "status"`
    );

    // Remove enum type if it exists
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."cocktail_status_enum"`
    );
  }
} 