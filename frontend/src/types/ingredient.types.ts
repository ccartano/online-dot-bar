export enum IngredientType {
  SPIRIT = 'spirit',
  LIQUEUR = 'liqueur',
  MIXER = 'mixer',
  GARNISH = 'garnish',
  BITTER = 'bitter',
  SYRUP = 'syrup',
  OTHER = 'other',
}

export interface Ingredient {
  id: number;
  name: string;
  description?: string | null;
  type: IngredientType;
  imageUrl?: string | null;
} 