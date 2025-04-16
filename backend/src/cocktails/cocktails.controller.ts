import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { Cocktail } from '../entities/cocktail.entity';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { FilterCocktailDto } from './dto/filter-cocktail.dto';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  findAll(@Query() filterDto: FilterCocktailDto): Promise<Cocktail[]> {
    return this.cocktailsService.findAll(filterDto);
  }

  @Get('by-ingredient/:ingredientId')
  findByIngredientId(
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('random') random?: string,
  ): Promise<Cocktail[]> {
    const isRandom = random === 'true';
    return this.cocktailsService.findByIngredientId(
      ingredientId,
      limit,
      isRandom,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): ReturnType<CocktailsService['findOne']> {
    return this.cocktailsService.findOne(id);
  }

  @Post()
  create(@Body() createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    return this.cocktailsService.create(createCocktailDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCocktailDto: UpdateCocktailDto,
  ): Promise<Cocktail> {
    return this.cocktailsService.update(id, updateCocktailDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cocktailsService.remove(id);
  }

  @Get('paperless/:paperlessId')
  findByPaperlessId(
    @Param('paperlessId', ParseIntPipe) paperlessId: number,
  ): Promise<Cocktail | null> {
    return this.cocktailsService.findByPaperlessId(paperlessId);
  }
}
