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