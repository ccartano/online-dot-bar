import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, CocktailIngredient])],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
