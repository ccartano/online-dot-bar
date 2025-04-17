import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1744912905103 implements MigrationInterface {
  name = 'CreateTables1744912905103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set the search path to our schema
    await queryRunner.query(`SET search_path TO online_bar_schema`);

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
                "type" character varying,
                "imageUrl" character varying,
                CONSTRAINT "PK_ingredient_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."glass_type" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "icon" character varying,
                CONSTRAINT "PK_glass_type_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_category_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."cocktail_ingredient" (
                "id" SERIAL NOT NULL,
                "amount" double precision,
                "unit" character varying,
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

    // Drop tables (sequences will be dropped automatically)
    await queryRunner.query(
      `DROP TABLE "online_bar_schema"."cocktail_ingredient"`,
    );
    await queryRunner.query(`DROP TABLE "online_bar_schema"."category"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."glass_type"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."ingredient"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."cocktail"`);
  }
}
