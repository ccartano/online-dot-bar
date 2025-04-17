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
                CONSTRAINT "UQ_3c44065317e8aad1dc6ecb8f7c3" UNIQUE ("name"),
                CONSTRAINT "PK_2640ba026b49f47c99d3a3219c2" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."ingredient" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "type" character varying,
                "imageUrl" character varying,
                CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."glass_type" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "icon" character varying,
                CONSTRAINT "PK_8c0c0c0c0c0c0c0c0c0c0c0c0c0" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "online_bar_schema"."category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
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
                CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"),
                CONSTRAINT "FK_cocktail" FOREIGN KEY ("cocktailId") REFERENCES "online_bar_schema"."cocktail"("id"),
                CONSTRAINT "FK_ingredient" FOREIGN KEY ("ingredientId") REFERENCES "online_bar_schema"."ingredient"("id")
            )
        `);

    // Create sequences in our schema
    await queryRunner.query(`
            CREATE SEQUENCE "online_bar_schema"."cocktail_id_seq" OWNED BY "online_bar_schema"."cocktail"."id";
            CREATE SEQUENCE "online_bar_schema"."ingredient_id_seq" OWNED BY "online_bar_schema"."ingredient"."id";
            CREATE SEQUENCE "online_bar_schema"."glass_type_id_seq" OWNED BY "online_bar_schema"."glass_type"."id";
            CREATE SEQUENCE "online_bar_schema"."category_id_seq" OWNED BY "online_bar_schema"."category"."id";
            CREATE SEQUENCE "online_bar_schema"."cocktail_ingredient_id_seq" OWNED BY "online_bar_schema"."cocktail_ingredient"."id";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET search_path TO online_bar_schema`);

    // Drop sequences first
    await queryRunner.query(`
            DROP SEQUENCE IF EXISTS "online_bar_schema"."cocktail_id_seq";
            DROP SEQUENCE IF EXISTS "online_bar_schema"."ingredient_id_seq";
            DROP SEQUENCE IF EXISTS "online_bar_schema"."glass_type_id_seq";
            DROP SEQUENCE IF EXISTS "online_bar_schema"."category_id_seq";
            DROP SEQUENCE IF EXISTS "online_bar_schema"."cocktail_ingredient_id_seq";
        `);

    // Then drop tables
    await queryRunner.query(
      `DROP TABLE "online_bar_schema"."cocktail_ingredient"`,
    );
    await queryRunner.query(`DROP TABLE "online_bar_schema"."category"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."glass_type"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."ingredient"`);
    await queryRunner.query(`DROP TABLE "online_bar_schema"."cocktail"`);
  }
}
