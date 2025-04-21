import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    return this.searchService.search(query);
  }

  @Get('by-ingredients')
  async searchByIngredients(@Query('ingredients') ingredients: string) {
    const ingredientList = ingredients
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
    return this.searchService.searchByIngredients(ingredientList);
  }
} 