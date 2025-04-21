export enum IngredientType {
  SPIRIT = 'spirit',
  LIQUEUR = 'liqueur',
  FORTIFIED_WINE = 'fortified_wine',
  APERITIF_DIGESTIF = 'aperitif_digestif',
  AROMATIC_BITTER = 'aromatic_bitter',
  CITRUS_BITTER = 'citrus_bitter',
  HERBAL_BITTER = 'herbal_bitter',
  CARBONATED_MIXER = 'carbonated_mixer',
  JUICE = 'juice',
  DAIRY = 'dairy',
  HOT_BEVERAGE = 'hot_beverage',
  SIMPLE_SYRUP = 'simple_syrup',
  FLAVORED_SYRUP = 'flavored_syrup',
  SPECIALTY_SYRUP = 'specialty_syrup',
  FRUIT_GARNISH = 'fruit_garnish',
  HERB_GARNISH = 'herb_garnish',
  SPICE_GARNISH = 'spice_garnish',
  OTHER_GARNISH = 'other_garnish',
  WINE = 'wine',
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