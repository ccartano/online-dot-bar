import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { GlassType } from '../entities/glass-type.entity';
import { Category } from '../entities/category.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { FilterCocktailDto } from './dto/filter-cocktail.dto';

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
  ) {}

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
              qb.andWhere(
                `EXISTS (SELECT 1 FROM cocktail_ingredient ci WHERE ci."cocktailId" = cocktail.id AND ci."ingredientId" = :ingredientId${index})`,
                { [`ingredientId${index}`]: id },
              );
            });
          }),
        );
      }

      if (glassTypeNames && glassTypeNames.length > 0) {
        // Since we're not joining glassType, we need to use the ID
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

    // Log the first cocktail's glass type for debugging
    if (cocktails.length > 0) {
      console.log('First cocktail glass type:', {
        cocktailName: cocktails[0].name,
        glassTypeId: cocktails[0].glassTypeId,
      });
    }

    return cocktails;
  }

  async findOne(id: number): Promise<Cocktail> {
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
    return cocktail;
  }

  async findByPaperlessId(paperlessId: number): Promise<Cocktail | null> {
    return this.cocktailsRepository.findOne({
      where: { paperlessId },
      relations: ['ingredients', 'glassType', 'category'],
    });
  }

  async create(createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    // Find or throw error for glass type
    const glassType = await this.glassTypesRepository.findOne({
      where: { id: createCocktailDto.glassTypeId },
    });
    if (!glassType) {
      throw new NotFoundException(
        `Glass type with ID ${createCocktailDto.glassTypeId} not found`,
      );
    }

    // Find category if provided
    let category: Category | undefined;
    if (createCocktailDto.categoryId) {
      category = await this.categoriesRepository.findOne({
        where: { id: createCocktailDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createCocktailDto.categoryId} not found`,
        );
      }
    }

    // Create the cocktail
    const cocktail = this.cocktailsRepository.create({
      name: createCocktailDto.name,
      description: createCocktailDto.description,
      instructions: createCocktailDto.instructions,
      imageUrl: createCocktailDto.imageUrl,
      paperlessId: createCocktailDto.paperlessId,
      glassType,
      category,
    });

    const savedCocktail = await this.cocktailsRepository.save(cocktail);

    // Create cocktail ingredients
    const cocktailIngredients = await Promise.all(
      createCocktailDto.ingredients.map(async (ingredientDto) => {
        const ingredient = await this.ingredientsRepository.findOne({
          where: { id: ingredientDto.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(
            `Ingredient with ID ${ingredientDto.ingredientId} not found`,
          );
        }

        return this.cocktailIngredientsRepository.create({
          cocktail: savedCocktail,
          ingredient,
          amount: ingredientDto.amount,
          unit: ingredientDto.unit,
          notes: ingredientDto.notes,
          order: ingredientDto.order,
        });
      }),
    );

    await this.cocktailIngredientsRepository.save(cocktailIngredients);

    return this.findOne(savedCocktail.id);
  }

  async update(
    id: number,
    updateCocktailDto: UpdateCocktailDto,
  ): Promise<Cocktail> {
    await this.cocktailsRepository.update(id, updateCocktailDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cocktailsRepository.delete(id);
  }
}
