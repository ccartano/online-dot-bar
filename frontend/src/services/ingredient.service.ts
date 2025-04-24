import { getApiUrl } from '../config/api.config';
import { Ingredient } from '../types/ingredient.types';
import { AdminService } from '../services/admin.service';

// Fetch all ingredients
export const fetchIngredients = async (): Promise<Ingredient[]> => {
  const response = await fetch(getApiUrl('/ingredients'));
  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }
  return response.json();
};

// Fetch a single ingredient by ID
export const fetchIngredientById = async (id: number): Promise<Ingredient> => {
  const response = await fetch(getApiUrl(`/ingredients/${id}`));
  if (!response.ok) {
    throw new Error(`Failed to fetch ingredient with ID ${id}`);
  }
  return response.json();
};

// Fetch a single ingredient by slug
export const fetchIngredientBySlug = async (slug: string): Promise<Ingredient> => {
  const response = await fetch(getApiUrl(`/ingredients/by-slug/${slug}`));
  if (!response.ok) {
    throw new Error(`Failed to fetch ingredient with slug ${slug}`);
  }
  return response.json();
};

// Update an existing ingredient
export const updateIngredient = async (id: number, ingredientData: Partial<Omit<Ingredient, 'id'>>): Promise<Ingredient> => {
  const headers = await AdminService.getAdminHeaders();
  const response = await fetch(getApiUrl(`/ingredients/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(ingredientData),
  });

  if (!response.ok) {
    // Try to get error message from backend response body
    const errorBody = await response.text();
    console.error("Update ingredient error body:", errorBody);
    throw new Error(`Failed to update ingredient ${id}. Status: ${response.status}`);
  }
  return response.json();
};

// Delete an ingredient
export const deleteIngredient = async (id: number): Promise<void> => {
  const headers = await AdminService.getAdminHeaders();
  const response = await fetch(getApiUrl(`/ingredients/${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Delete ingredient error body:", errorBody);
    throw new Error(`Failed to delete ingredient ${id}. Status: ${response.status}`);
  }
};

// Consider adding a deleteIngredient function later if needed 