import { CocktailIngredient, Category, GlassType } from './index';
export declare class Cocktail {
    id: number;
    name: string;
    description: string;
    instructions: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    glassType: GlassType;
    category: Category;
    ingredients: CocktailIngredient[];
}
