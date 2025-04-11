import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { GlassType } from '../entities/glass-type.entity';
import { Category } from '../entities/category.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';

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

  async findAll(): Promise<Cocktail[]> {
    return this.cocktailsRepository.find({
      relations: [
        'glassType',
        'category',
        'ingredients',
        'ingredients.ingredient',
      ],
    });
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
