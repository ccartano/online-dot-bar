import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';

@Injectable()
export class CocktailsService {
  constructor(
    @InjectRepository(Cocktail)
    private cocktailsRepository: Repository<Cocktail>,
  ) {}

  async findAll(): Promise<Cocktail[]> {
    return this.cocktailsRepository.find();
  }

  async findOne(id: number): Promise<Cocktail> {
    return this.cocktailsRepository.findOne({ where: { id } });
  }

  async create(cocktail: Partial<Cocktail>): Promise<Cocktail> {
    const newCocktail = this.cocktailsRepository.create(cocktail);
    return this.cocktailsRepository.save(newCocktail);
  }

  async update(id: number, cocktail: Partial<Cocktail>): Promise<Cocktail> {
    await this.cocktailsRepository.update(id, cocktail);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cocktailsRepository.delete(id);
  }
}
