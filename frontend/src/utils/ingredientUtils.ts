import { IngredientType } from '../types/ingredient.types';

// Map of enum values to human-readable labels
export const INGREDIENT_TYPE_LABELS: Record<IngredientType, string> = {
  [IngredientType.SPIRIT]: 'Spirit',
  [IngredientType.LIQUEUR]: 'Liqueur',
  [IngredientType.FORTIFIED_WINE]: 'Fortified Wine',
  [IngredientType.APERITIF_DIGESTIF]: 'Aperitif/Digestif',
  [IngredientType.AROMATIC_BITTER]: 'Aromatic Bitter',
  [IngredientType.CITRUS_BITTER]: 'Citrus Bitter',
  [IngredientType.HERBAL_BITTER]: 'Herbal Bitter',
  [IngredientType.CARBONATED_MIXER]: 'Carbonated Mixer',
  [IngredientType.JUICE]: 'Juice',
  [IngredientType.DAIRY]: 'Dairy',
  [IngredientType.HOT_BEVERAGE]: 'Hot Beverage',
  [IngredientType.SIMPLE_SYRUP]: 'Simple Syrup',
  [IngredientType.FLAVORED_SYRUP]: 'Flavored Syrup',
  [IngredientType.SPECIALTY_SYRUP]: 'Specialty Syrup',
  [IngredientType.FRUIT_GARNISH]: 'Fruit Garnish',
  [IngredientType.HERB_GARNISH]: 'Herb Garnish',
  [IngredientType.SPICE_GARNISH]: 'Spice Garnish',
  [IngredientType.OTHER_GARNISH]: 'Other Garnish',
  [IngredientType.WINE]: 'Wine',
  [IngredientType.ENHANCERS]: 'Enhancers',
  [IngredientType.OTHER]: 'Other',
};

// Helper function to get the human-readable label for an ingredient type
export const getIngredientTypeLabel = (type: IngredientType): string => {
  return INGREDIENT_TYPE_LABELS[type] || type;
}; 