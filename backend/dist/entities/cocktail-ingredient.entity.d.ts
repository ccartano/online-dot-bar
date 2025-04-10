import { Cocktail, Ingredient } from './index';
export declare enum MeasurementUnit {
    OZ = "oz",
    ML = "ml",
    DASH = "dash",
    PINCH = "pinch",
    PIECE = "piece",
    SLICE = "slice",
    SPRIG = "sprig",
    TWIST = "twist",
    WEDGE = "wedge",
    OTHER = "other"
}
export declare class CocktailIngredient {
    id: number;
    cocktail: Cocktail;
    ingredient: Ingredient;
    amount: number;
    unit: MeasurementUnit;
    notes: string;
    order: number;
}
