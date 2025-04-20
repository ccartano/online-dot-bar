import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWineAndEnhancersToIngredientType1712345678903 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new values to the enum
        await queryRunner.query(`
            ALTER TYPE "public"."ingredient_type_enum" ADD VALUE IF NOT EXISTS 'wine';
            ALTER TYPE "public"."ingredient_type_enum" ADD VALUE IF NOT EXISTS 'enhancers';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing values from an enum type
        // We would need to create a new enum type and migrate the data
        // For now, we'll just log a warning
        console.warn('Cannot remove enum values in PostgreSQL. Manual intervention required if needed.');
    }
} 