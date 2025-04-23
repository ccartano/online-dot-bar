import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Ingredient[]> {
    // Try to get from cache first
    const cachedData = await this.cacheManager.get<Ingredient[]>('ingredients:all');
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, get from database
    const ingredients = await this.ingredientsRepository.find();
    
    // Store in cache and track the key
    await this.cacheManager.set('ingredients:all', ingredients, 60 * 60 * 24); // 24 hours TTL
    await this.addCacheKey('ingredients:all');
    
    return ingredients;
  }

  async findOne(id: number): Promise<Ingredient> {
    // Try to get from cache first
    const cacheKey = `ingredient:${id}`;
    const cachedData = await this.cacheManager.get<Ingredient>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    // Store in cache and track the key
    await this.cacheManager.set(cacheKey, ingredient, 60 * 60 * 24); // 24 hours TTL
    await this.addCacheKey(cacheKey);

    return ingredient;
  }

  async findBySlug(slug: string): Promise<Ingredient> {
    // Try to get from cache first
    const cacheKey = `ingredient:slug:${slug}`;
    const cachedData = await this.cacheManager.get<Ingredient>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const ingredient = await this.ingredientsRepository.findOne({
      where: { slug },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with slug ${slug} not found`);
    }

    // Store in cache and track the key
    await this.cacheManager.set(cacheKey, ingredient, 60 * 60 * 24); // 24 hours TTL
    await this.addCacheKey(cacheKey);

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
    const result = await this.ingredientsRepository.save(newIngredient);
    
    // Invalidate cache
    await this.invalidateCache();
    
    return result;
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
    const result = await this.ingredientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    
    // Invalidate cache
    await this.invalidateCache();
  }

  private async invalidateCache(): Promise<void> {
    // Since we can't list all keys, we'll maintain a set of cache keys
    const cacheKeys = await this.cacheManager.get<string[]>('ingredients:cache-keys') || [];
    
    // Delete all known cache keys
    await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
    
    // Reset the cache keys
    await this.cacheManager.set('ingredients:cache-keys', [], 60 * 60 * 24);
  }

  private async addCacheKey(key: string): Promise<void> {
    const cacheKeys = await this.cacheManager.get<string[]>('ingredients:cache-keys') || [];
    if (!cacheKeys.includes(key)) {
      cacheKeys.push(key);
      await this.cacheManager.set('ingredients:cache-keys', cacheKeys, 60 * 60 * 24);
    }
  }
}
