import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugsToIngredients1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add the slug column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "ingredient" 
      ADD COLUMN IF NOT EXISTS "slug" character varying;
    `);

    // Update existing ingredients to have slugs based on their names
    await queryRunner.query(`
      UPDATE "ingredient"
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
      ALTER TABLE "ingredient"
      ALTER COLUMN "slug" SET NOT NULL,
      ADD CONSTRAINT "UQ_ingredient_slug" UNIQUE ("slug");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ingredient"
      DROP CONSTRAINT IF EXISTS "UQ_ingredient_slug",
      DROP COLUMN IF EXISTS "slug";
    `);
  }
}
