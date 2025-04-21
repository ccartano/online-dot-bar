import { Injectable } from '@nestjs/common';
import { CocktailsService } from '../cocktails/cocktails.service';
import { IngredientsService } from '../ingredients/ingredients.service';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'cocktail' | 'ingredient';
  ingredientType?: string;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly cocktailService: CocktailsService,
    private readonly ingredientService: IngredientsService,
  ) {}

  private fuzzyMatch(str: string, query: string): boolean {
    const strLower = str.toLowerCase();
    const queryLower = query.toLowerCase();
    let queryIndex = 0;
    
    for (let i = 0; i < strLower.length; i++) {
      if (strLower[i] === queryLower[queryIndex]) {
        queryIndex++;
        if (queryIndex === queryLower.length) return true;
      }
    }
    return false;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const [cocktails, ingredients] = await Promise.all([
      this.cocktailService.findAll(),
      this.ingredientService.findAll(),
    ]);

    const results: SearchResult[] = [];

    // Search cocktails
    cocktails.forEach(cocktail => {
      if (this.fuzzyMatch(cocktail.name, query)) {
        results.push({
          id: cocktail.id.toString(),
          name: cocktail.name,
          slug: cocktail.slug,
          type: 'cocktail',
        });
      }
    });

    // Search ingredients
    ingredients.forEach(ingredient => {
      if (this.fuzzyMatch(ingredient.name, query)) {
        results.push({
          id: ingredient.id.toString(),
          name: ingredient.name,
          slug: ingredient.slug,
          type: 'ingredient',
          ingredientType: ingredient.type,
        });
      }
    });

    // Sort results by relevance (exact matches first, then fuzzy matches)
    const sortedResults = results.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    });

    // Return only the top 10 results
    return sortedResults.slice(0, 10);
  }
} 