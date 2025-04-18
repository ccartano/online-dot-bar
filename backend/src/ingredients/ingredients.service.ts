import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(CocktailIngredient)
    private cocktailIngredientsRepository: Repository<CocktailIngredient>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find();
  }

  async findOne(id: number): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async findBySlug(slug: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { slug },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with slug ${slug} not found`);
    }
    return ingredient;
  }

  async create(ingredient: Partial<Ingredient>): Promise<Ingredient> {
    // Generate slug from name if not provided
    if (!ingredient.slug) {
      ingredient.slug = ingredient.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const newIngredient = this.ingredientsRepository.create(ingredient);
    return this.ingredientsRepository.save(newIngredient);
  }

  async update(
    id: number,
    ingredient: Partial<Ingredient>,
  ): Promise<Ingredient> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if we're updating the name
      if (ingredient.name) {
        // Find if there's an existing ingredient with the new name
        const existingIngredient = await this.ingredientsRepository.findOne({
          where: { name: ingredient.name },
        });

        if (existingIngredient && existingIngredient.id !== id) {
          // If we found a match, merge the ingredients
          // Update all cocktail ingredients that use the old ingredient to use the existing one
          await queryRunner.manager.update(
            CocktailIngredient,
            { ingredient: { id } },
            { ingredient: existingIngredient },
          );

          // Delete the old ingredient
          await queryRunner.manager.delete(Ingredient, { id });

          await queryRunner.commitTransaction();
          return existingIngredient;
        }
      }

      // If no merge needed, proceed with normal update
      await queryRunner.manager.update(Ingredient, id, ingredient);
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    await this.ingredientsRepository.delete(id);
  }
}
