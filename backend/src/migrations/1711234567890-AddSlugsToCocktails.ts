import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugsToCocktails1711234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add the slug column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "cocktail" 
      ADD COLUMN IF NOT EXISTS "slug" character varying;
    `);

    // Update existing cocktails to have slugs based on their names
    await queryRunner.query(`
      UPDATE "cocktail"
      SET "slug" = LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
          '-+$',  -- Remove one or more dashes at the end
          ''
        )
      )
      WHERE "slug" IS NULL;
    `);

    // Make the slug column unique and not null
    await queryRunner.query(`
      ALTER TABLE "cocktail"
      ALTER COLUMN "slug" SET NOT NULL,
      ADD CONSTRAINT "UQ_cocktail_slug" UNIQUE ("slug");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cocktail"
      DROP CONSTRAINT IF EXISTS "UQ_cocktail_slug",
      DROP COLUMN IF EXISTS "slug";
    `);
  }
}
