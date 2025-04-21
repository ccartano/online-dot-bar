import axios from 'axios';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'cocktail' | 'ingredient';
  ingredientType?: string;
}

export const searchItems = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}; 