import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
export declare class IngredientsService {
    private ingredientsRepository;
    constructor(ingredientsRepository: Repository<Ingredient>);
    findAll(): Promise<Ingredient[]>;
    findOne(id: number): Promise<Ingredient>;
    create(ingredient: Partial<Ingredient>): Promise<Ingredient>;
    update(id: number, ingredient: Partial<Ingredient>): Promise<Ingredient>;
    remove(id: number): Promise<void>;
}
