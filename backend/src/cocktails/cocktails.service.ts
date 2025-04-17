import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  // ConflictException, // Keep commented out for now
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Not } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

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
              qb.orWhere(
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
    return cocktails;
  }

  async findOne(id: number): Promise<{
    cocktail: Cocktail;
    potentialAkas: { id: number; name: string }[];
    potentialVariations: { id: number; name: string }[];
  }> {
    const cocktail = await this.cocktailsRepository.findOne({
      where: { id },
      relations: [
        'glassType',
        'category',
        'ingredients',
        'ingredients.ingredient',
      ],
    });
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    }

    let potentialAkas: { id: number; name: string }[] = [];
    let potentialVariations: { id: number; name: string }[] = [];

    // Fetch Potential AKAs (same akaSignature, different id)
    if (cocktail.akaSignature) {
      potentialAkas = await this.cocktailsRepository.find({
        select: ['id', 'name'], // Select only needed fields
        where: {
          akaSignature: cocktail.akaSignature,
          id: Not(cocktail.id), // Exclude the cocktail itself
        },
      });
    }

    // Fetch Potential Variations (same variationSignature, different id, different akaSignature)
    if (cocktail.variationSignature) {
      potentialVariations = await this.cocktailsRepository.find({
        select: ['id', 'name'], // Select only needed fields
        where: {
          variationSignature: cocktail.variationSignature,
          id: Not(cocktail.id), // Exclude the cocktail itself
          // Exclude cocktails that are already identified as AKAs
          ...(cocktail.akaSignature && {
            akaSignature: Not(cocktail.akaSignature),
          }),
        },
      });
    }

    return {
      cocktail,
      potentialAkas,
      potentialVariations,
    };
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

  async create(createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    const { ingredients, categoryId, glassTypeId, name, ...cocktailBaseData } =
      createCocktailDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
        name, // Explicitly include name here
        glassTypeId: glassType ? glassType.id : null,
        glassType: glassType || undefined,
        category: category || undefined,
        variationSignature, // 3. Save the calculated signatures
        akaSignature,
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
            unit: ingredientDto.unit,
            order: ingredientDto.order,
          });
          await queryRunner.manager.save(cocktailIngredient);
        }
      }

      await queryRunner.commitTransaction();

      // Refetch with relations and handle the new return type
      const result = await this.findOne(savedCocktail.id);
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
    const { ingredients, categoryId, ...cocktailBaseData } = updateCocktailDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cocktail = await queryRunner.manager.findOne(Cocktail, {
        where: { id },
        relations: ['ingredients', 'category', 'glassType'], // Load existing relations
      });

      if (!cocktail) {
        throw new NotFoundException(`Cocktail with ID ${id} not found`);
      }

      // Fetch new category if categoryId is provided
      let categoryToUpdate: Category | null | undefined = undefined; // undefined means no change
      if (categoryId !== undefined) {
        // Check if categoryId is explicitly in the DTO
        if (categoryId === null) {
          categoryToUpdate = null; // Set to null
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
        ...(categoryToUpdate !== undefined && { category: categoryToUpdate }), // Only include category if it was changed
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
              unit: ingredientDto.unit,
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
  }
}
