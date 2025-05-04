import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  // ConflictException, // Keep commented out for now
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Not, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cocktail } from '../entities/cocktail.entity';
import {
  CocktailIngredientDto, // Corrected import name
  CreateCocktailDto,
} from './dto/create-cocktail.dto';
import { GlassType } from '../entities/glass-type.entity';
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
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

  constructor(
    @InjectRepository(Cocktail)
    private cocktailsRepository: Repository<Cocktail>,
    @InjectRepository(GlassType)
    private glassTypesRepository: Repository<GlassType>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(CocktailIngredient)
    private cocktailIngredientsRepository: Repository<CocktailIngredient>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  // Cache Management
  private getCacheKey(filterDto?: FilterCocktailDto): string {
    if (!filterDto) return 'cocktails:all';
    return `cocktails:filtered:${JSON.stringify(filterDto)}`;
  }

  private async invalidateCache(): Promise<void> {
    const cacheKeys = await this.cacheManager.get<string[]>('cocktails:cache-keys') || [];
    await Promise.all([
      this.cacheManager.del('cocktails:all'),
      ...cacheKeys.map(key => this.cacheManager.del(key))
    ]);
    await this.cacheManager.set('cocktails:cache-keys', [], this.CACHE_TTL);
  }

  private async addCacheKey(key: string): Promise<void> {
    const cacheKeys = await this.cacheManager.get<string[]>('cocktails:cache-keys') || [];
    if (!cacheKeys.includes(key)) {
      cacheKeys.push(key);
      await this.cacheManager.set('cocktails:cache-keys', cacheKeys, this.CACHE_TTL);
    }
  }

  // Signature Calculation
  private _calculateSignatures(ingredients: CocktailIngredientDto[]): {
    variationSignature: string | null;
    akaSignature: string | null;
  } {
    if (!ingredients?.length) {
      return { variationSignature: null, akaSignature: null };
    }

    const sortedIngredients = [...ingredients].sort((a, b) =>
      a.ingredientId < b.ingredientId ? -1 : 1,
    );

    const variationSignature = sortedIngredients
      .map((i) => i.ingredientId)
      .join('-');

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

  // Query Building
  private buildBaseQuery() {
    return this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .addSelect('cocktail.glassTypeId');
  }

  private applyFilters(queryBuilder: any, filterDto: FilterCocktailDto) {
    const { name, ingredientIds, glassTypeNames } = filterDto;

    if (name) {
      queryBuilder.andWhere('LOWER(cocktail.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (ingredientIds?.length) {
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

    if (glassTypeNames?.length) {
      queryBuilder.andWhere('cocktail.glassTypeId IN (:...glassTypeIds)', {
        glassTypeIds: glassTypeNames.map(name => this.glassTypesRepository.findOneBy({ name })),
      });
    }
  }

  // CRUD Operations
  async findAll(filterDto?: FilterCocktailDto): Promise<Cocktail[]> {
    const cacheKey = this.getCacheKey(filterDto);
    const cachedData = await this.cacheManager.get<Cocktail[]>(cacheKey);
    if (cachedData) return cachedData;

    const queryBuilder = this.buildBaseQuery();
    if (filterDto) this.applyFilters(queryBuilder, filterDto);

    const cocktails = await queryBuilder.getMany();
    await this.cacheManager.set(cacheKey, cocktails, this.CACHE_TTL);
    await this.addCacheKey(cacheKey);
    
    return cocktails;
  }

  async findOne(id: number): Promise<{
    cocktail: Cocktail;
    potentialAkas: { id: number; name: string }[];
    potentialVariations: { id: number; name: string }[];
    variations: Cocktail[];
  }> {
    const cacheKey = `cocktail:${id}`;
    const cachedData = await this.cacheManager.get<{
      cocktail: Cocktail;
      potentialAkas: { id: number; name: string }[];
      potentialVariations: { id: number; name: string }[];
      variations: Cocktail[];
    }>(cacheKey);
    if (cachedData) return cachedData;

    const cocktail = await this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.glassType', 'glassType')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .where('cocktail.id = :id', { id })
      .getOne();

    if (!cocktail) {
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    }

    const [potentialAkas, potentialVariations, variations] = await Promise.all([
      this.findPotentialAkas(cocktail),
      this.findPotentialVariations(cocktail),
      this.findVariations(cocktail.id),
    ]);

    const response = {
      cocktail,
      potentialAkas,
      potentialVariations,
      variations,
    };

    await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
    await this.addCacheKey(cacheKey);

    return response;
  }

  private async findPotentialAkas(cocktail: Cocktail) {
    if (!cocktail.akaSignature) return [];
    return this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .select(['cocktail.id', 'cocktail.name'])
      .where('cocktail.akaSignature = :akaSignature', {
        akaSignature: cocktail.akaSignature,
      })
      .andWhere('cocktail.id != :id', { id: cocktail.id })
      .getMany();
  }

  private async findPotentialVariations(cocktail: Cocktail) {
    if (!cocktail.variationSignature) return [];
    return this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .select(['cocktail.id', 'cocktail.name'])
      .where('cocktail.variationSignature = :variationSignature', {
        variationSignature: cocktail.variationSignature,
      })
      .andWhere('cocktail.id != :id', { id: cocktail.id })
      .andWhere(
        cocktail.akaSignature
          ? 'cocktail.akaSignature != :akaSignature'
          : '1=1',
        cocktail.akaSignature
          ? { akaSignature: cocktail.akaSignature }
          : {},
      )
      .getMany();
  }

  private async findVariations(parentId: number) {
    return this.cocktailsRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.glassType', 'glassType')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .where('cocktail.parentId = :id', { id: parentId })
      .getMany();
  }

  async findByPaperlessId(paperlessId: number): Promise<Cocktail | null> {
    return this.cocktailsRepository.findOne({
      where: { paperlessId },
      relations: ['ingredients', 'glassType'],
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { ingredients, glassTypeId, name, parentId, ...cocktailBaseData } = createCocktailDto;
      const slug = await this.generateSlug(name, parentId);
      const { variationSignature, akaSignature } = this._calculateSignatures(ingredients);

      await this.checkForDuplicates(name, akaSignature, variationSignature);

      const glassType = glassTypeId
        ? await this.glassTypesRepository.findOneBy({ id: glassTypeId })
        : null;

      if (glassTypeId && !glassType) {
        throw new NotFoundException(`GlassType with ID ${glassTypeId} not found`);
      }

      const newCocktail = await this.createCocktailEntity(
        queryRunner,
        {
          ...cocktailBaseData,
          name: name.toLowerCase(),
          slug,
          glassTypeId: glassType?.id,
          glassType,
          variationSignature,
          akaSignature,
          parentId,
        }
      );

      if (ingredients?.length) {
        await this.createCocktailIngredients(queryRunner, newCocktail, ingredients);
      }

      await queryRunner.commitTransaction();
      await this.invalidateCache();
      
      // Return the saved cocktail directly instead of fetching it again
      return newCocktail;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) throw err;
      console.error('Error creating cocktail:', err);
      throw new InternalServerErrorException('Failed to create cocktail');
    } finally {
      await queryRunner.release();
    }
  }

  private async generateSlug(name: string, parentId?: number): Promise<string> {
    let slug = slugify(name);

    if (parentId) {
      const existingVariations = await this.cocktailsRepository.find({
        where: { parentId },
      });
      return `${slug}-v${existingVariations.length + 1}`;
    }

    const existingCocktail = await this.cocktailsRepository.findOne({
      where: { slug },
    });

    if (existingCocktail) {
      const existingVariations = await this.cocktailsRepository.find({
        where: { slug: Like(`${slug}-v%`) },
      });
      return `${slug}-v${existingVariations.length + 1}`;
    }

    return slug;
  }

  private async checkForDuplicates(
    name: string,
    akaSignature: string | null,
    variationSignature: string | null,
  ) {
    if (akaSignature) {
      const potentialAka = await this.cocktailsRepository.findOne({
        where: { akaSignature, name: Not(name) },
      });
      if (potentialAka) {
        console.warn(
          `Potential AKA found for cocktail "${name}": "${potentialAka.name}" (ID: ${potentialAka.id})`,
        );
      }
    }

    if (variationSignature) {
      const potentialVariations = await this.cocktailsRepository.find({
        where: {
          variationSignature,
          ...(akaSignature && { akaSignature: Not(akaSignature) }),
        },
      });
      if (potentialVariations.length > 0) {
        console.warn(
          `Potential variations found for cocktail "${name}" based on ingredient IDs: ${potentialVariations
            .map((p) => `"${p.name}" (ID: ${p.id})`)
            .join(', ')}`,
        );
      }
    }
  }

  private async createCocktailEntity(
    queryRunner: any,
    data: Partial<Cocktail>,
  ): Promise<Cocktail> {
    const newCocktail = this.cocktailsRepository.create(data);
    return queryRunner.manager.save(newCocktail);
  }

  private async createCocktailIngredients(
    queryRunner: any,
    cocktail: Cocktail,
    ingredients: CocktailIngredientDto[],
  ): Promise<void> {
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
        cocktail,
        ingredient,
        amount: ingredientDto.amount,
        unit: ingredientDto.unit?.toLowerCase(),
        order: ingredientDto.order,
      });
      await queryRunner.manager.save(cocktailIngredient);
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
    const { ingredients, name, ...cocktailBaseData } =
      updateCocktailDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cocktail = await queryRunner.manager.findOne(Cocktail, {
        where: { id },
        relations: ['ingredients', 'glassType'],
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

      // Merge basic data
      queryRunner.manager.merge(Cocktail, cocktail, {
        ...cocktailBaseData,
        ...(name && { name: name.toLowerCase() }), // Downcase name
        ...(slug && { slug }),
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
