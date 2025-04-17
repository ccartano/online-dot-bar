export enum IngredientType {
  SPIRIT = 'spirit',
  LIQUEUR = 'liqueur',
  MIXER = 'mixer',
  GARNISH = 'garnish',
  WINE = 'fortified wines & wines',
  BITTER = 'bitter',
  SYRUP = 'syrup',
  ENHANCERS = 'flavor enhancers',
  OTHER = 'other',
}

export interface Ingredient {
  id: number;
  name: string;
  description?: string | null;
  type: IngredientType;
  imageUrl?: string | null;
} 