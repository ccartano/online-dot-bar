import { Injectable, Inject } from '@nestjs/common';
import { CocktailsService } from '../cocktails/cocktails.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
  private readonly CACHE_TTL = 60 * 60; // 1 hour in seconds

  constructor(
    private readonly cocktailService: CocktailsService,
    private readonly ingredientService: IngredientsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Cocktail)
    private cocktailRepository: Repository<Cocktail>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  private getCacheKey(type: 'search' | 'ingredients', query: string): string {
    return `search:${type}:${query.toLowerCase()}`;
  }

  async searchByIngredients(ingredients: string[]): Promise<SearchResult[]> {
    if (!ingredients?.length) return [];

    // Normalize and clean up ingredients
    const normalizedIngredients = ingredients
      .map(ing => ing.trim().toLowerCase())
      .filter(ing => ing.length > 0);

    const cacheKey = this.getCacheKey('ingredients', normalizedIngredients.join(','));
    const cachedResults = await this.cacheManager.get<SearchResult[]>(cacheKey);
    if (cachedResults) return cachedResults;

    // Use database-level filtering with improved search
    const cocktails = await this.cocktailRepository
      .createQueryBuilder('cocktail')
      .leftJoinAndSelect('cocktail.ingredients', 'cocktailIngredients')
      .leftJoinAndSelect('cocktailIngredients.ingredient', 'ingredient')
      .where(
        normalizedIngredients.map((_, index) => 
          `EXISTS (
            SELECT 1 FROM cocktail_ingredient ci 
            JOIN ingredient i ON ci."ingredientId" = i.id 
            WHERE ci."cocktailId" = cocktail.id 
            AND (
              LOWER(i.name) = LOWER(:ingredient${index})
              OR LOWER(i.name) LIKE LOWER(:ingredient${index}Pattern)
              OR LOWER(i.name) LIKE LOWER(:ingredient${index}Word)
            )
          )`
        ).join(' AND '),
        normalizedIngredients.reduce((acc, ingredient, index) => ({
          ...acc,
          [`ingredient${index}`]: ingredient,
          [`ingredient${index}Pattern`]: `%${ingredient}%`,
          [`ingredient${index}Word`]: `% ${ingredient} %`,
        }), {})
      )
      .getMany();

    const results: SearchResult[] = cocktails.map(cocktail => {
      const matchedIngredients = cocktail.ingredients
        .map(ci => ci.ingredient.name)
        .filter(name => {
          const nameLower = name.toLowerCase();
          return normalizedIngredients.some(ing => 
            nameLower === ing || 
            nameLower.includes(` ${ing} `) ||
            nameLower.startsWith(`${ing} `) ||
            nameLower.endsWith(` ${ing}`)
          );
        });

      return {
        id: cocktail.id.toString(),
        name: cocktail.name,
        slug: cocktail.slug,
        type: 'cocktail' as const,
        matchedIngredients: [...new Set(matchedIngredients)] // Remove duplicates
      };
    });

    // Sort results by number of matched ingredients and name
    const sortedResults = results.sort((a, b) => {
      const aMatches = a.matchedIngredients?.length || 0;
      const bMatches = b.matchedIngredients?.length || 0;
      if (bMatches !== aMatches) return bMatches - aMatches;
      return a.name.localeCompare(b.name);
    });

    await this.cacheManager.set(cacheKey, sortedResults, this.CACHE_TTL);
    return sortedResults;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = this.getCacheKey('search', query);
    const cachedResults = await this.cacheManager.get<SearchResult[]>(cacheKey);
    if (cachedResults) return cachedResults;

    // Use database-level text search
    const [cocktails, ingredients] = await Promise.all([
      this.cocktailRepository
        .createQueryBuilder('cocktail')
        .where('LOWER(cocktail.name) LIKE LOWER(:query)', { query: `%${query}%` })
        .getMany(),
      this.ingredientRepository
        .createQueryBuilder('ingredient')
        .where('LOWER(ingredient.name) LIKE LOWER(:query)', { query: `%${query}%` })
        .getMany()
    ]);

    const results: SearchResult[] = [
      ...cocktails.map(cocktail => ({
        id: cocktail.id.toString(),
        name: cocktail.name,
        slug: cocktail.slug,
        type: 'cocktail' as const,
      })),
      ...ingredients.map(ingredient => ({
        id: ingredient.id.toString(),
        name: ingredient.name,
        slug: ingredient.slug,
        type: 'ingredient' as const,
        ingredientType: ingredient.type,
      }))
    ];

    // Sort results by relevance
    const sortedResults = results.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0, 10);

    await this.cacheManager.set(cacheKey, sortedResults, this.CACHE_TTL);
    return sortedResults;
  }

  private fuzzyMatch(text: string, query: string): boolean {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    return textLower.includes(queryLower);
  }
} 