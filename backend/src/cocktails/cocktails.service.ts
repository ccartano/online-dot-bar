import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  // ConflictException, // Keep commented out for now
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Not } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cocktail } from '../entities/cocktail.entity';
import {
  CocktailIngredientDto, // Corrected import name
  CreateCocktailDto,
} from './dto/create-cocktail.dto';
import { GlassType } from '../entities/glass-type.entity';
import { Category } from '../entities/category.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import {
  UpdateCocktailDto,
  UpdateCocktailIngredientDto,
} from './dto/update-cocktail.dto';
import { FilterCocktailDto } from './dto/filter-cocktail.dto';
import { DataSource } from 'typeorm';
import { slugify } from '../utils/slugify';

@Injectable()
export class CocktailsService {
  constructor(
    @InjectRepository(Cocktail)
    private cocktailsRepository: Repository<Cocktail>,
    @InjectRepository(GlassType)
    private glassTypesRepository: Repository<GlassType>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(CocktailIngredient)
    private cocktailIngredientsRepository: Repository<CocktailIngredient>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  private getCacheKey(filterDto?: FilterCocktailDto): string {
    if (!filterDto) return 'cocktails:all';
    return `cocktails:filtered:${JSON.stringify(filterDto)}`;
  }

  // Helper function to calculate ingredient signatures
  private _calculateSignatures(ingredients: CocktailIngredientDto[]): {
    variationSignature: string | null;
    akaSignature: string | null;
  } {
    if (!ingredients || ingredients.length === 0) {
      return { variationSignature: null, akaSignature: null };
    }

    // Sort ingredients for consistent signatures
    const sortedIngredients = [...ingredients].sort((a, b) =>
      a.ingredientId < b.ingredientId ? -1 : 1,
    );

    // Variation signature: sorted ingredient IDs
    const variationSignature = sortedIngredients
      .map((i) => i.ingredientId)
      .join('-');

    // AKA signature: sorted ingredientId-amount-unit strings
    const akaSignature = sortedIngredients
      .map(
        (i) =>
          `${i.ingredientId}-${i.amount ?? 'N/A'}-${(i.unit ?? 'N/A')
            .toString()
            .toLowerCase()
            .trim()}`,
      )
      .join('_');

    return { variationSignature, akaSignature };
  }

  async findAll(filterDto?: FilterCocktailDto): Promise<Cocktail[]> {
    const cacheKey = this.getCacheKey(filterDto);
    
    // Try to get from cache first
    const cachedData = await this.cacheManager.get<Cocktail[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, get from database
    const queryBuilder = this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.category', 'category')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .addSelect('cocktail.glassTypeId');

    if (filterDto) {
      const { name, categoryId, ingredientIds, glassTypeNames } = filterDto;

      if (name) {
        queryBuilder.andWhere('LOWER(cocktail.name) LIKE LOWER(:name)', {
          name: `%${name}%`,
        });
      }

      if (categoryId) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId });
      }

      if (ingredientIds && ingredientIds.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            ingredientIds.forEach((id, index) => {
              qb.andWhere(
                `EXISTS (SELECT 1 FROM cocktail_ingredient ci WHERE ci."cocktailId" = cocktail.id AND ci."ingredientId" = :ingredientId${index})`,
                { [`ingredientId${index}`]: id },
              );
            });
          }),
        );
      }

      if (glassTypeNames && glassTypeNames.length > 0) {
        const glassTypeIds = await this.glassTypesRepository
          .createQueryBuilder('glassType')
          .select('glassType.id')
          .where('glassType.name IN (:...names)', { names: glassTypeNames })
          .getMany()
          .then((types) => types.map((t) => t.id));

        if (glassTypeIds.length > 0) {
          queryBuilder.andWhere('cocktail.glassTypeId IN (:...glassTypeIds)', {
            glassTypeIds,
          });
        }
      }
    }

    const cocktails = await queryBuilder.getMany();
    
    // Store in cache and track the key
    await this.cacheManager.set(cacheKey, cocktails, 60 * 60 * 24); // 24 hours TTL
    await this.addCacheKey(cacheKey);
    
    return cocktails;
  }

  async findOne(id: number): Promise<{
    cocktail: Cocktail;
    potentialAkas: { id: number; name: string }[];
    potentialVariations: { id: number; name: string }[];
    variations: Cocktail[];
  }> {
    // Try to get from cache first
    const cacheKey = `cocktail:${id}`;
    const cachedData = await this.cacheManager.get<{
      cocktail: Cocktail;
      potentialAkas: { id: number; name: string }[];
      potentialVariations: { id: number; name: string }[];
      variations: Cocktail[];
    }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Use a single query with proper joins
    const result = await this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.glassType', 'glassType')
      .leftJoinAndSelect('cocktail.category', 'category')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .where('cocktail.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    }

    // Fetch potential AKAs and variations in a single query
    const [potentialAkas, potentialVariations, variations] = await Promise.all([
      result.akaSignature
        ? this.cocktailsRepository
            .createQueryBuilder('cocktail')
            .select(['cocktail.id', 'cocktail.name'])
            .where('cocktail.akaSignature = :akaSignature', {
              akaSignature: result.akaSignature,
            })
            .andWhere('cocktail.id != :id', { id })
            .getMany()
        : [],
      result.variationSignature
        ? this.cocktailsRepository
            .createQueryBuilder('cocktail')
            .select(['cocktail.id', 'cocktail.name'])
            .where('cocktail.variationSignature = :variationSignature', {
              variationSignature: result.variationSignature,
            })
            .andWhere('cocktail.id != :id', { id })
            .andWhere(
              result.akaSignature
                ? 'cocktail.akaSignature != :akaSignature'
                : '1=1',
              result.akaSignature
                ? { akaSignature: result.akaSignature }
                : {},
            )
            .getMany()
        : [],
      // Fetch all variations of this cocktail
      this.cocktailsRepository
        .createQueryBuilder('cocktail')
        .leftJoinAndSelect('cocktail.glassType', 'glassType')
        .leftJoinAndSelect('cocktail.category', 'category')
        .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
        .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
        .where('cocktail.parentId = :id', { id })
        .getMany(),
    ]);

    const response = {
      cocktail: result,
      potentialAkas,
      potentialVariations,
      variations,
    };

    // Store in cache
    await this.cacheManager.set(cacheKey, response, 60 * 60 * 24); // 24 hours TTL
    await this.addCacheKey(cacheKey);

    return response;
  }

  async findByPaperlessId(paperlessId: number): Promise<Cocktail | null> {
    return this.cocktailsRepository.findOne({
      where: { paperlessId },
      relations: ['ingredients', 'glassType', 'category'],
    });
  }

  async findByIngredientId(
    ingredientId: number,
    limit?: number,
    random?: boolean,
  ): Promise<Cocktail[]> {
    const queryBuilder = this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .innerJoin('cocktail.ingredients', 'ci')
      .where('ci.ingredientId = :ingredientId', { ingredientId })
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients') // Re-join to select all ingredients
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .leftJoinAndSelect('cocktail.glassType', 'glassType'); // Include glass type

    let cocktails = await queryBuilder.getMany();

    if (random) {
      // Fisher-Yates (Knuth) Shuffle algorithm
      for (let i = cocktails.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cocktails[i], cocktails[j]] = [cocktails[j], cocktails[i]];
      }
    }

    if (limit && limit > 0) {
      cocktails = cocktails.slice(0, limit);
    }

    return cocktails;
  }

  async findBySlug(slug: string): Promise<Cocktail> {
    const cocktail = await this.cocktailsRepository.findOne({
      where: { slug },
      relations: [
        'glassType',
        'category',
        'ingredients',
        'ingredients.ingredient',
      ],
    });
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with slug ${slug} not found`);
    }
    return cocktail;
  }

  async create(createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    const { ingredients, categoryId, glassTypeId, name, parentId, ...cocktailBaseData } =
      createCocktailDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate base slug from name
      let slug = slugify(name);

      // If this is a variation, append a unique identifier
      if (parentId) {
        const parentCocktail = await this.cocktailsRepository.findOne({
          where: { id: parentId },
        });
        if (!parentCocktail) {
          throw new NotFoundException(`Parent cocktail with ID ${parentId} not found`);
        }
        
        // Find existing variations to determine the next number
        const existingVariations = await this.cocktailsRepository.find({
          where: { parentId },
        });
        
        // Append a number to make the slug unique
        slug = `${slug}-v${existingVariations.length + 1}`;
      } else {
        // Only check for existing slug if this is not a variation
        const existingCocktail = await this.cocktailsRepository.findOne({
          where: { slug },
        });
        if (existingCocktail) {
          throw new Error(`A cocktail with the slug '${slug}' already exists`);
        }
      }

      // 1. Calculate signatures for the new cocktail
      const { variationSignature, akaSignature } = this._calculateSignatures(
        ingredients || [],
      );

      // 2. Check for potential duplicates/variations before creating
      if (akaSignature) {
        const potentialAka = await this.cocktailsRepository.findOne({
          where: { akaSignature, name: Not(name) }, // Same ingredients, different name
        });
        if (potentialAka) {
          // For now, log a warning. Could throw ConflictException or return specific info.
          console.warn(
            `Potential AKA found for cocktail "${name}": "${potentialAka.name}" (ID: ${potentialAka.id})`,
          );
          // throw new ConflictException(`Cocktail with the exact same ingredients (AKA "${potentialAka.name}") already exists.`);
        }
      }

      if (variationSignature) {
        const potentialVariations = await this.cocktailsRepository.find({
          where: {
            variationSignature,
            // Optional: Exclude exact AKA matches if already handled or logged
            ...(akaSignature && { akaSignature: Not(akaSignature) }),
          },
        });
        if (potentialVariations.length > 0) {
          // Log variations found
          console.warn(
            `Potential variations found for cocktail "${name}" based on ingredient IDs: ${potentialVariations
              .map((p) => `"${p.name}" (ID: ${p.id})`)
              .join(', ')}`,
          );
        }
      }

      // Fetch related entities if IDs are provided
      const glassType = glassTypeId
        ? await this.glassTypesRepository.findOneBy({ id: glassTypeId })
        : null;
      const category = categoryId
        ? await this.categoriesRepository.findOneBy({ id: categoryId })
        : null;

      if (glassTypeId && !glassType)
        throw new NotFoundException(
          `GlassType with ID ${glassTypeId} not found`,
        );
      if (categoryId && !category)
        throw new NotFoundException(`Category with ID ${categoryId} not found`);

      const newCocktail = this.cocktailsRepository.create({
        ...cocktailBaseData, // Use the rest of the DTO data
        name: name.toLowerCase(), // Downcase name
        slug, // Add the generated slug
        glassTypeId: glassType ? glassType.id : null,
        glassType: glassType || undefined,
        category: category || undefined,
        variationSignature, // 3. Save the calculated signatures
        akaSignature,
        parentId, // Include parentId if it exists
        source: createCocktailDto.source?.toLowerCase(), // Downcase source
        description: createCocktailDto.description?.toLowerCase(), // Downcase description
        instructions: createCocktailDto.instructions?.toLowerCase() // Downcase instructions
      });
      const savedCocktail = await queryRunner.manager.save(newCocktail);

      if (ingredients && ingredients.length > 0) {
        for (const ingredientDto of ingredients) {
          const ingredient = await this.ingredientsRepository.findOneBy({
            id: ingredientDto.ingredientId,
          });
          if (!ingredient) {
            throw new NotFoundException(
              `Ingredient with ID ${ingredientDto.ingredientId} not found`,
            );
          }
          const cocktailIngredient = this.cocktailIngredientsRepository.create({
            cocktail: savedCocktail,
            ingredient: ingredient,
            amount: ingredientDto.amount,
            unit: ingredientDto.unit?.toLowerCase(), // Downcase unit
            order: ingredientDto.order,
          });
          await queryRunner.manager.save(cocktailIngredient);
        }
      }

      await queryRunner.commitTransaction();

      // Refetch with relations and handle the new return type
      const result = await this.findOne(savedCocktail.id);
      await this.invalidateCache();
      return result.cocktail;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error creating cocktail:', err);
      throw new InternalServerErrorException('Failed to create cocktail');
    } finally {
      await queryRunner.release();
    }
  }

  // Helper function to create CocktailIngredient entity
  private async createCocktailIngredientEntity(
    cocktail: Cocktail,
    ingredientDto: UpdateCocktailIngredientDto,
    index: number,
  ): Promise<CocktailIngredient> {
    if (ingredientDto.ingredientId === undefined) {
      throw new NotFoundException(
        `Ingredient ID missing for ingredient at index ${index}`,
      );
    }
    const ingredient = await this.ingredientsRepository.findOneBy({
      id: ingredientDto.ingredientId,
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID ${ingredientDto.ingredientId} not found`,
      );
    }

    return this.cocktailIngredientsRepository.create({
      cocktail: cocktail,
      ingredient,
      amount: ingredientDto.amount,
      unit: ingredientDto.unit,
      order: ingredientDto.order ?? index,
    });
  }

  async update(
    id: number,
    updateCocktailDto: UpdateCocktailDto,
  ): Promise<Cocktail> {
    const { ingredients, categoryId, name, ...cocktailBaseData } =
      updateCocktailDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cocktail = await queryRunner.manager.findOne(Cocktail, {
        where: { id },
        relations: ['ingredients', 'category', 'glassType'],
      });

      if (!cocktail) {
        throw new NotFoundException(`Cocktail with ID ${id} not found`);
      }

      // If name is being updated, generate new slug
      let slug = cocktail.slug;
      if (name && name !== cocktail.name) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+$/, '');

        // Check if new slug already exists
        const existingCocktail = await this.cocktailsRepository.findOne({
          where: { slug },
        });
        if (existingCocktail && existingCocktail.id !== id) {
          throw new Error(`A cocktail with the slug '${slug}' already exists`);
        }
      }

      // Fetch new category if categoryId is provided
      let categoryToUpdate: Category | null | undefined = undefined;
      if (categoryId !== undefined) {
        if (categoryId === null) {
          categoryToUpdate = null;
        } else {
          categoryToUpdate = await this.categoriesRepository.findOneBy({
            id: categoryId,
          });
          if (!categoryToUpdate) {
            throw new NotFoundException(
              `Category with ID ${categoryId} not found`,
            );
          }
        }
      }

      // Merge basic data and potentially the new category
      queryRunner.manager.merge(Cocktail, cocktail, {
        ...cocktailBaseData,
        ...(name && { name: name.toLowerCase() }), // Downcase name
        ...(slug && { slug }),
        ...(categoryToUpdate !== undefined && { category: categoryToUpdate }),
        ...(updateCocktailDto.source && { source: updateCocktailDto.source.toLowerCase() }), // Downcase source
        ...(updateCocktailDto.description && { description: updateCocktailDto.description.toLowerCase() }), // Downcase description
        ...(updateCocktailDto.instructions && { instructions: updateCocktailDto.instructions.toLowerCase() }) // Downcase instructions
      });

      await queryRunner.manager.save(Cocktail, cocktail); // Save changes to cocktail entity

      // Update ingredients if provided
      if (ingredients) {
        // Check if 'ingredients' array exists in DTO
        // Remove existing ingredients
        await queryRunner.manager.delete(CocktailIngredient, {
          cocktail: { id },
        });

        // Add new ingredients from DTO
        for (const ingredientDto of ingredients) {
          const ingredientEntity = await queryRunner.manager.findOneBy(
            Ingredient,
            { id: ingredientDto.ingredientId },
          );
          if (!ingredientEntity) {
            throw new NotFoundException(
              `Ingredient with ID ${ingredientDto.ingredientId} not found`,
            );
          }
          const newCocktailIngredient = queryRunner.manager.create(
            CocktailIngredient,
            {
              cocktail: { id },
              ingredient: ingredientEntity,
              amount: ingredientDto.amount,
              unit: ingredientDto.unit?.toLowerCase(), // Downcase unit
              order: ingredientDto.order,
            },
          );
          await queryRunner.manager.save(
            CocktailIngredient,
            newCocktailIngredient,
          );
        }
      }

      await queryRunner.commitTransaction();

      // Refetch the updated cocktail with relations and handle the new return type
      const result = await this.findOne(id);
      await this.invalidateCache();
      return result.cocktail;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error updating cocktail:', err);
      throw new InternalServerErrorException('Failed to update cocktail');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    // Need to remove related CocktailIngredient entries first due to constraints
    await this.cocktailIngredientsRepository.delete({ cocktail: { id } });
    const result = await this.cocktailsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    }
    await this.invalidateCache();
  }

  private async invalidateCache(): Promise<void> {
    // Delete the main cache
    await this.cacheManager.del('cocktails:all');
    
    // Since we can't list all keys, we'll maintain a set of cache keys
    const cacheKeys = await this.cacheManager.get<string[]>('cocktails:cache-keys') || [];
    
    // Delete all known cache keys
    await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
    
    // Reset the cache keys
    await this.cacheManager.set('cocktails:cache-keys', [], 60 * 60 * 24);
  }

  private async addCacheKey(key: string): Promise<void> {
    const cacheKeys = await this.cacheManager.get<string[]>('cocktails:cache-keys') || [];
    if (!cacheKeys.includes(key)) {
      cacheKeys.push(key);
      await this.cacheManager.set('cocktails:cache-keys', cacheKeys, 60 * 60 * 24);
    }
  }

  private generateIngredientSignature(ingredients: CocktailIngredientDto[]): string {
    return ingredients
      .map(ci => `${ci.ingredientId}:${ci.amount || ''}:${ci.unit || ''}`)
      .sort()
      .join('|');
  }

  private async findSimilarCocktails(
    name: string,
    ingredientSignature: string,
  ): Promise<Cocktail[]> {
    const queryBuilder = this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient');

    // First try exact name match
    const exactMatch = await queryBuilder
      .where('LOWER(cocktail.name) = LOWER(:name)', { name })
      .getOne();

    if (exactMatch) {
      return [exactMatch];
    }

    // Then try similar names and ingredient signatures
    return queryBuilder
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(cocktail.name) LIKE LOWER(:namePattern)', {
            namePattern: `%${name}%`,
          }).orWhere('cocktail.variationSignature = :signature', {
            signature: ingredientSignature,
          });
        }),
      )
      .getMany();
  }

  async createWithDuplicateCheck(createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    const ingredientSignature = this.generateIngredientSignature(createCocktailDto.ingredients);
    const similarCocktails = await this.findSimilarCocktails(
      createCocktailDto.name,
      ingredientSignature,
    );

    if (similarCocktails.length > 0) {
      const exactMatch = similarCocktails.find(
        (c) => c.name.toLowerCase() === createCocktailDto.name.toLowerCase(),
      );

      if (exactMatch) {
        // If exact match exists, create a new variation linked to the existing cocktail
        const newCocktail = await this.create({
          ...createCocktailDto,
          parentId: exactMatch.id,
          status: 'active', // Mark as active since we've verified it's a legitimate variation
          source: createCocktailDto.source // Use the source from Paperless (american_bartenders_guide or encyclopedia)
        });

        return newCocktail;
      }

      // If no exact match but similar cocktails exist, create as variation
      const parentCocktail = similarCocktails[0];
      const newCocktail = await this.create({
        ...createCocktailDto,
        parentId: parentCocktail.id,
        status: 'active', // Mark as active since we've verified it's a legitimate variation
        source: createCocktailDto.source // Use the source from Paperless (american_bartenders_guide or encyclopedia)
      });

      return newCocktail;
    }

    // If no similar cocktails found, create as new
    return this.create(createCocktailDto);
  }
}
