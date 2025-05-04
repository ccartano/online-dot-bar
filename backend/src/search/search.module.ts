import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CocktailsModule } from '../cocktails/cocktails.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { Ingredient } from '../entities/ingredient.entity';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 1000, // 1 hour in milliseconds
      max: 100, // maximum number of items in cache
    }),
    TypeOrmModule.forFeature([Cocktail, Ingredient]),
    CocktailsModule,
    IngredientsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {} 