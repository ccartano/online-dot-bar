import { IngredientType, INGREDIENT_TYPE_LABELS } from './constants';

// Helper function to get the human-readable label for an ingredient type
export const getIngredientTypeLabel = (type: IngredientType): string => {
  return INGREDIENT_TYPE_LABELS[type];
};

// Helper function to format ingredient type for display
export const formatIngredientType = (type: string): string => {
  if (!type) return '';
  
  // First try to get the label from our mapping
  const label = INGREDIENT_TYPE_LABELS[type as IngredientType];
  if (label) return label;
  
  // If not found in mapping, format the string
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 