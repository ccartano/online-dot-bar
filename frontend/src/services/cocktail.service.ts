import { getApiUrl } from '../config/api.config';
import { AdminService } from './admin.service';
import { Cocktail, CocktailDetailData } from '../types/cocktail.types';

export const cocktailService = {
  async getAllCocktails(): Promise<Cocktail[]> {
    const response = await fetch(getApiUrl('/cocktails'));
    if (!response.ok) {
      throw new Error('Failed to fetch cocktails');
    }
    return response.json();
  },

  async getCocktailById(id: number): Promise<Cocktail> {
    const response = await fetch(getApiUrl(`/cocktails/${id}`));
    if (!response.ok) {
      throw new Error('Failed to fetch cocktail');
    }
    return response.json();
  },

  async createCocktail(cocktail: Omit<Cocktail, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cocktail> {
    const headers = await AdminService.getAdminHeaders();
    const response = await fetch(getApiUrl('/cocktails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cocktail),
    });
    if (!response.ok) {
      throw new Error('Failed to create cocktail');
    }
    return response.json();
  },

  async updateCocktail(id: number, cocktail: Partial<Cocktail>): Promise<Cocktail> {
    const headers = await AdminService.getAdminHeaders();
    const response = await fetch(getApiUrl(`/cocktails/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(cocktail),
    });
    if (!response.ok) {
      throw new Error('Failed to update cocktail');
    }
    return response.json();
  },

  async deleteCocktail(id: number): Promise<void> {
    const headers = await AdminService.getAdminHeaders();
    const response = await fetch(getApiUrl(`/cocktails/${id}`), {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete cocktail');
    }
  },
};

// Fetch all cocktails
export const fetchCocktails = async (): Promise<Cocktail[]> => {
  const response = await fetch(getApiUrl('/cocktails'));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktails');
  }
  return response.json();
};

// Fetch a single cocktail by slug
export const fetchCocktailBySlug = async (slug: string): Promise<CocktailDetailData> => {
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
    throw new Error(`Failed to fetch cocktails by ingredient`);
  }
  return response.json();
};

// Fetch detailed cocktail data by slug including variations
export const fetchCocktailDetailBySlug = async (slug: string): Promise<CocktailDetailData> => {
  const response = await fetch(getApiUrl(`/cocktails/by-slug/${slug}/detail`));
  if (!response.ok) {
    throw new Error('Failed to fetch cocktail details');
  }
  return response.json();
};