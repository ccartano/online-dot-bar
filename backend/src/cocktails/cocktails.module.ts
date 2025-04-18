import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { GlassType } from '../entities/glass-type.entity';
import { Category } from '../entities/category.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cocktail,
      GlassType,
      Category,
      Ingredient,
      CocktailIngredient,
    ]),
  ],
  controllers: [CocktailsController],
  providers: [CocktailsService],
  exports: [CocktailsService],
})
export class CocktailsModule {}
