import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1744912905103 implements MigrationInterface {
  name = 'CreateTables1744912905103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set the search path to our schema
    await queryRunner.query(`SET search_path TO online_bar_schema`);

    // Create enum type for ingredient types
    await queryRunner.query(`
            CREATE TYPE "online_bar_schema"."ingredient_type_enum" AS ENUM (
                'spirit', 'liqueur', 'mixer', 'garnish', 'bitter', 'syrup', 'other'
            )
        `);

    // Create enum type for measurement units
    await queryRunner.query(`
            CREATE TYPE "online_bar_schema"."measurement_unit_enum" AS ENUM (
                'oz', 'ml', 'dash', 'pinch', 'piece', 'slice', 'sprig', 'twist', 'wedge', 'tsp', 'tbsp', 'other'
            )
        `);

    // Create tables with explicit schema
    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."cocktail" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "instructions" character varying,
                "imageUrl" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "paperlessId" integer,
                "source" character varying,
                "glassTypeId" integer,
                "categoryId" integer,
                "variationSignature" character varying(1024),
                "akaSignature" character varying(2048),
                CONSTRAINT "UQ_cocktail_name" UNIQUE ("name"),
                CONSTRAINT "PK_cocktail_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."ingredient" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "type" "online_bar_schema"."ingredient_type_enum" NOT NULL DEFAULT 'other',
                "imageUrl" character varying,
                CONSTRAINT "PK_ingredient_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."glass_type" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "imageUrl" character varying,
                "icon" character varying,
                CONSTRAINT "PK_glass_type_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                CONSTRAINT "PK_category_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."cocktail_ingredient" (
                "id" SERIAL NOT NULL,
                "amount" double precision,
                "unit" "online_bar_schema"."measurement_unit_enum" NOT NULL DEFAULT 'other',
                "notes" character varying,
                "order" integer NOT NULL,
                "cocktailId" integer,
                "ingredientId" integer,
                CONSTRAINT "PK_cocktail_ingredient_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_cocktail_ingredient_cocktail" FOREIGN KEY ("cocktailId") REFERENCES "online_bar_schema"."cocktail"("id"),
                CONSTRAINT "FK_cocktail_ingredient_ingredient" FOREIGN KEY ("ingredientId") REFERENCES "online_bar_schema"."ingredient"("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET search_path TO online_bar_schema`);

    // Drop tables first
    await queryRunner.query(
      `DROP TABLE "online_bar_schema"."cocktail_ingredient"`,
    );
    await queryRunner.query(`DROP TABLE "online_bar_schema"."category"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."glass_type"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."ingredient"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."cocktail"`);

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE "online_bar_schema"."measurement_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "online_bar_schema"."ingredient_type_enum"`,
    );
  }
}
