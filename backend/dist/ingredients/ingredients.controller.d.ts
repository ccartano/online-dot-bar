import { IngredientsService } from './ingredients.service';
import { Ingredient } from '../entities/ingredient.entity';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    findAll(): Promise<Ingredient[]>;
    findOne(id: string): Promise<Ingredient>;
    create(ingredient: Partial<Ingredient>): Promise<Ingredient>;
    update(id: string, ingredient: Partial<Ingredient>): Promise<Ingredient>;
    remove(id: string): Promise<void>;
}
