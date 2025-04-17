import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744916756696 implements MigrationInterface {
  name = 'InitialSchema1744916756696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "glass_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "imageUrl" character varying, "icon" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aa22e5adb9b2bc5ef7c433f355e" UNIQUE ("name"), CONSTRAINT "PK_40705ee482b97cefe1cea0bd400" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cocktail" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "instructions" character varying, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paperlessId" integer, "source" character varying, "glassTypeId" integer, "categoryId" integer, "variationSignature" character varying(1024), "akaSignature" character varying(2048), CONSTRAINT "UQ_3c44065317e8aad1dc6ecb8f7c3" UNIQUE ("name"), CONSTRAINT "PK_2640ba026b49f47c99d3a3219c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cocktail_ingredient" ("id" SERIAL NOT NULL, "amount" numeric(10,2), "unit" character varying, "notes" character varying, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cocktailId" integer NOT NULL, "ingredientId" integer NOT NULL, CONSTRAINT "PK_1ef3c4b6d4f38312c7ddcddb1c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ingredient_type_enum" AS ENUM('spirit', 'liqueur', 'mixer', 'garnish', 'bitter', 'syrup', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ingredient" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "type" "public"."ingredient_type_enum" NOT NULL DEFAULT 'other', "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b6802ac7fbd37aa71d856a95d8f" UNIQUE ("name"), CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD CONSTRAINT "FK_50f5123705935292b9d7a072ad3" FOREIGN KEY ("glassTypeId") REFERENCES "glass_type"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" ADD CONSTRAINT "FK_ef99244900b5d3e05ea5234c704" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6" FOREIGN KEY ("cocktailId") REFERENCES "cocktail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_5d58556001d996d83cde9351b85" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_5d58556001d996d83cde9351b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP CONSTRAINT "FK_ef99244900b5d3e05ea5234c704"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cocktail" DROP CONSTRAINT "FK_50f5123705935292b9d7a072ad3"`,
    );
    await queryRunner.query(`DROP TABLE "ingredient"`);
    await queryRunner.query(`DROP TYPE "public"."ingredient_type_enum"`);
    await queryRunner.query(`DROP TABLE "cocktail_ingredient"`);
    await queryRunner.query(`DROP TABLE "cocktail"`);
    await queryRunner.query(`DROP TABLE "glass_type"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
