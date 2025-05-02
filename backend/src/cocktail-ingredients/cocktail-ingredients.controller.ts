import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CocktailIngredientsService } from './cocktail-ingredients.service';
import { AdminGuard } from '../auth/admin.guard';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';

@Controller('cocktail-ingredients')
@UseGuards(AdminGuard)
export class CocktailIngredientsController {
  constructor(private readonly cocktailIngredientsService: CocktailIngredientsService) {}

  @Get()
  async findAll(): Promise<CocktailIngredient[]> {
    return this.cocktailIngredientsService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { amount: number | null; unit: string | null },
  ): Promise<CocktailIngredient> {
    return this.cocktailIngredientsService.update(id, updateData);
  }
} 