export enum IngredientType {
  SPIRIT = 'spirit',
  LIQUEUR = 'liqueur',
  MIXER = 'mixer',
  GARNISH = 'garnish',
  WINE = 'wine',
  BITTER = 'bitter',
  SYRUP = 'syrup',
  ENHANCERS = 'enhancers',
  OTHER = 'other',
}

export interface Ingredient {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  type: IngredientType;
  imageUrl?: string | null;
} 