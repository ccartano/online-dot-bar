import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CocktailsModule } from '../cocktails/cocktails.module';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [CocktailsModule, IngredientsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {} 