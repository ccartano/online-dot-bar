import axios from 'axios';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'cocktail' | 'ingredient';
  ingredientType?: string;
  matchedIngredients?: string[];
}

export const searchItems = async (query: string): Promise<SearchResult[]> => {
  try {
    if (query.includes(',')) {
      const ingredients = query.split(',').map(i => i.trim()).filter(i => i.length > 0);
      const response = await axios.get(`/api/search/by-ingredients?ingredients=${ingredients.join(',')}`);
      return response.data;
    }

    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}; 