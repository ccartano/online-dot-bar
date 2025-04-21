import { Injectable } from '@nestjs/common';
import { CocktailsService } from '../cocktails/cocktails.service';
import { IngredientsService } from '../ingredients/ingredients.service';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'cocktail' | 'ingredient';
  ingredientType?: string;
  matchedIngredients?: string[];
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

  async searchByIngredients(ingredients: string[]): Promise<SearchResult[]> {
    if (!ingredients || ingredients.length === 0) {
      return [];
    }

    const cocktails = await this.cocktailService.findAll();
    const results: SearchResult[] = [];

    // For each cocktail, check if it contains ALL of the searched ingredients
    cocktails.forEach(cocktail => {
      const matchedIngredients: string[] = [];
      let hasAllIngredients = true;

      // Check each searched ingredient against the cocktail's ingredients
      ingredients.forEach(searchedIngredient => {
        let found = false;
        cocktail.ingredients.forEach(cocktailIngredient => {
          // Use a more precise text-based search that looks for the ingredient name as a whole word
          const ingredientName = cocktailIngredient.ingredient.name.toLowerCase();
          const searchTerm = searchedIngredient.toLowerCase();
          
          // Check for exact match or if the ingredient name contains the search term as a whole word
          if (ingredientName === searchTerm || 
              ingredientName.includes(` ${searchTerm} `) || 
              ingredientName.startsWith(`${searchTerm} `) || 
              ingredientName.endsWith(` ${searchTerm}`)) {
            matchedIngredients.push(cocktailIngredient.ingredient.name);
            found = true;
          }
        });
        if (!found) {
          hasAllIngredients = false;
        }
      });

      // Only add to results if all ingredients were found
      if (hasAllIngredients) {
        results.push({
          id: cocktail.id.toString(),
          name: cocktail.name,
          slug: cocktail.slug,
          type: 'cocktail',
          matchedIngredients: [...new Set(matchedIngredients)] // Remove duplicates
        });
      }
    });

    // Sort results by number of matched ingredients (most matches first)
    const sortedResults = results.sort((a, b) => {
      const aMatches = a.matchedIngredients?.length || 0;
      const bMatches = b.matchedIngredients?.length || 0;
      return bMatches - aMatches;
    });

    // Return only the top 10 results
    return sortedResults.slice(0, 10);
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