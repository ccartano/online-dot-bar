import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from '../entities/ingredient.entity';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll(): Promise<Ingredient[]> {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Ingredient> {
    return this.ingredientsService.findOne(+id);
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Ingredient> {
    return this.ingredientsService.findBySlug(slug);
  }

  @Post()
  create(@Body() ingredient: Partial<Ingredient>): Promise<Ingredient> {
    return this.ingredientsService.create(ingredient);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() ingredient: Partial<Ingredient>,
  ): Promise<Ingredient> {
    return this.ingredientsService.update(+id, ingredient);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(+id);
  }
}
