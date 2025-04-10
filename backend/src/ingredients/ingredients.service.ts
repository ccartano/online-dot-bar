import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find();
  }

  async findOne(id: number): Promise<Ingredient> {
    return this.ingredientsRepository.findOne({ where: { id } });
  }

  async create(ingredient: Partial<Ingredient>): Promise<Ingredient> {
    const newIngredient = this.ingredientsRepository.create(ingredient);
    return this.ingredientsRepository.save(newIngredient);
  }

  async update(
    id: number,
    ingredient: Partial<Ingredient>,
  ): Promise<Ingredient> {
    await this.ingredientsRepository.update(id, ingredient);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ingredientsRepository.delete(id);
  }
}
