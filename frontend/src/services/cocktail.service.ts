import { getApiUrl } from '../config/api.config';
import { GlassType } from '../types/glass.types';
import { Category } from '../types/category.types';

// Match the backend MeasurementUnit enum
export enum MeasurementUnit {
  OZ = 'OZ',
  ML = 'ML',
  DASH = 'DASH',
  DROP = 'DROP',
  BARSPOON = 'BARSPOON',
  PINCH = 'PINCH',
  TWIST = 'TWIST',
  WEDGE = 'WEDGE',
  SLICE = 'SLICE',
  SPRIG = 'SPRIG',
  LEAF = 'LEAF',
  CUBE = 'CUBE',
  PIECE = 'PIECE',
  WHOLE = 'WHOLE',
  PART = 'PART',
  TO_TASTE = 'TO_TASTE',
  TSP = 'TSP',
  TBSP = 'TBSP',
  OTHER = 'OTHER',
}

export interface CocktailIngredient {
  id?: number;
  amount?: number | null;
  unit?: MeasurementUnit;
  notes?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  ingredient: {
    id?: number;
    name: string;
    description?: string | null;
    type?: string;
    imageUrl?: string | null;
  };
}

export interface Cocktail {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  instructions?: string;
  imageUrl?: string | null;
  paperlessId?: number | null;
  source?: string | null;
  glassTypeId?: number | null;
  glassType?: GlassType;
  categoryId?: number | null;
  category?: Category;
  createdAt?: string;
  created?: string;
  updatedAt: string;
  ingredients: CocktailIngredient[];
  variationSignature?: string;
  akaSignature?: string;
  status: 'active' | 'pending';
  tags?: string[];
}

export class CocktailService {
  // Core service functionality can be added here if needed
  // For example: API calls, data transformations, etc.
}

// Fetch all cocktails
export const fetchCocktails = async (): Promise<Cocktail[]> => {
  const response = await fetch(getApiUrl('/cocktails'));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktails');
  }
  return response.json();
};

// Fetch a single cocktail by slug
export const fetchCocktailBySlug = async (slug: string): Promise<Cocktail> => {
  const response = await fetch(getApiUrl(`/cocktails/by-slug/${slug}`));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktail');
  }
  return response.json();
};

// Fetch cocktails by ingredient ID
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