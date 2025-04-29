import { IngredientType } from '../utils/constants';

export interface Ingredient {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: IngredientType;
  parentId?: number;
  parent?: Ingredient;
  variations?: Ingredient[];
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
} 