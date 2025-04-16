import { getApiUrl } from '../config/api.config';
import { Ingredient } from '../types/ingredient.types';

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

// Update an existing ingredient
export const updateIngredient = async (id: number, ingredientData: Partial<Omit<Ingredient, 'id'>>): Promise<Ingredient> => {
  const response = await fetch(getApiUrl(`/ingredients/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers if needed for admin actions
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

// Consider adding a deleteIngredient function later if needed 