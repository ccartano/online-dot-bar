import { CocktailIngredient } from './index';
export declare enum IngredientType {
    SPIRIT = "spirit",
    MIXER = "mixer",
    GARNISH = "garnish",
    BITTER = "bitter",
    SYRUP = "syrup",
    OTHER = "other"
}
export declare class Ingredient {
    id: number;
    name: string;
    description: string;
    type: IngredientType;
    imageUrl: string;
    cocktails: CocktailIngredient[];
}
