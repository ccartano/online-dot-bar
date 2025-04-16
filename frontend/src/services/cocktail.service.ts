import { getApiUrl } from '../config/api.config';

// Match the backend MeasurementUnit enum
export enum MeasurementUnit {
  OZ = 'oz',
  ML = 'ml',
  DASH = 'dash',
  PINCH = 'pinch',
  PIECE = 'piece',
  SLICE = 'slice',
  SPRIG = 'sprig',
  TWIST = 'twist',
  WEDGE = 'wedge',
  TSP = 'tsp',
  TBSP = 'tbsp',
  OTHER = 'other'
}

export interface CocktailIngredient {
  amount?: number;
  unit?: MeasurementUnit;
  notes?: string;
  order: number;
  ingredient: {
    id?: number;
    name: string;
    description?: string;
    type?: string;
    imageUrl?: string;
  };
}

export interface ParsedCocktail {
  name: string;
  ingredients: CocktailIngredient[];
  instructions: string;
  sourceDocumentId: number;
  paperlessId?: number;
  created?: string;
  imageUrl?: string;
  glassType?: {
    id: number;
    name: string;
    icon?: string;
  };
  glassTypeId?: number;
  status: 'active' | 'pending';
  tags?: string[];
}

export interface Cocktail extends ParsedCocktail {
  id: number;
}

export class CocktailService {
  // Core service functionality can be added here if needed
  // For example: API calls, data transformations, etc.
}

// Fetch all cocktails (existing function, might need updates)
export const fetchCocktails = async (): Promise<Cocktail[]> => {
  // ... existing implementation ...
  const response = await fetch(getApiUrl('/cocktails'));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktails');
  }
  return response.json();
};

// Fetch a single cocktail (existing function, might need updates)
export const fetchCocktailById = async (id: string): Promise<Cocktail> => {
  // ... existing implementation ...
  const response = await fetch(getApiUrl(`/cocktails/${id}`));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktail');
  }
  return response.json();
};

// New function to fetch cocktails by ingredient ID
export const fetchCocktailsByIngredient = async (
  ingredientId: number, 
  limit: number = 10, 
  random: boolean = true
): Promise<Cocktail[]> => {
  const url = getApiUrl(`/cocktails/by-ingredient/${ingredientId}?limit=${limit}&random=${random}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch cocktails for ingredient ${ingredientId}`);
  }
  return response.json();
};

// Add update/create/delete service functions if needed 