import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { CocktailIngredientsService } from './cocktail-ingredients.service';
import { CocktailIngredientsController } from './cocktail-ingredients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CocktailIngredient])],
  controllers: [CocktailIngredientsController],
  providers: [CocktailIngredientsService],
  exports: [CocktailIngredientsService],
})
export class CocktailIngredientsModule {} 