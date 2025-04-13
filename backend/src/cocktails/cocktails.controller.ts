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
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  async findAll() {
    const cocktails = await this.cocktailsService.findAll();
    return cocktails.map((cocktail) => ({
      ...cocktail,
      status: 'active',
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cocktail = await this.cocktailsService.findOne(+id);
    return {
      ...cocktail,
      status: 'active',
    };
  }

  @Post()
  async create(@Body() createCocktailDto: CreateCocktailDto) {
    const cocktail = await this.cocktailsService.create(createCocktailDto);
    return {
      ...cocktail,
      status: 'active',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCocktailDto: UpdateCocktailDto,
  ) {
    const cocktail = await this.cocktailsService.update(+id, updateCocktailDto);
    return {
      ...cocktail,
      status: 'active',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.cocktailsService.remove(+id);
  }

  @Get('paperless/:paperlessId')
  async findByPaperlessId(@Param('paperlessId') paperlessId: string) {
    const cocktail =
      await this.cocktailsService.findByPaperlessId(+paperlessId);
    if (!cocktail) {
      return { status: 'pending' };
    }
    return {
      ...cocktail,
      status: 'active',
    };
  }
}
