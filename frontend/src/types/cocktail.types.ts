import { MeasurementUnit } from '../utils/constants';

export interface GlassType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface CocktailIngredient {
  id?: number;
  ingredient: Ingredient;
  amount?: number;
  unit?: MeasurementUnit;
  notes?: string;
  order: number;
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
  parentId?: number;
  parent?: Cocktail;
  variations?: Cocktail[];
}

export interface CocktailDetailData {
  cocktail: Cocktail;
  potentialAkas: { id: number; name: string; slug?: string }[];
  potentialVariations: { id: number; name: string; slug?: string }[];
  variations: Cocktail[];
} 