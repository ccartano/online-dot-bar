import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';

@Injectable()
export class CocktailIngredientsService {
  constructor(
    @InjectRepository(CocktailIngredient)
    private cocktailIngredientsRepository: Repository<CocktailIngredient>,
  ) {}

  async findAll(): Promise<CocktailIngredient[]> {
    return this.cocktailIngredientsRepository.find({
      relations: ['ingredient', 'cocktail'],
      order: {
        cocktail: {
          name: 'ASC',
        },
        ingredient: {
          name: 'ASC',
        },
      },
    });
  }

  async update(
    id: number,
    updateData: { amount: number | null; unit: string | null },
  ): Promise<CocktailIngredient> {
    const cocktailIngredient = await this.cocktailIngredientsRepository.findOne({
      where: { id },
      relations: ['ingredient', 'cocktail'],
    });

    if (!cocktailIngredient) {
      throw new NotFoundException(`Cocktail ingredient with ID ${id} not found`);
    }

    Object.assign(cocktailIngredient, updateData);
    return this.cocktailIngredientsRepository.save(cocktailIngredient);
  }
} 