import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { Cocktail } from '../entities/cocktail.entity';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  findAll(): Promise<Cocktail[]> {
    return this.cocktailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cocktail> {
    return this.cocktailsService.findOne(+id);
  }

  @Post()
  create(@Body() cocktail: Partial<Cocktail>): Promise<Cocktail> {
    return this.cocktailsService.create(cocktail);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() cocktail: Partial<Cocktail>,
  ): Promise<Cocktail> {
    return this.cocktailsService.update(+id, cocktail);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.cocktailsService.remove(+id);
  }
}
