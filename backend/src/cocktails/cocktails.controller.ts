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
  UseGuards,
} from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { GlassTypesService } from '../glass-types/glass-types.service';
import { Cocktail } from '../entities/cocktail.entity';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { FilterCocktailDto } from './dto/filter-cocktail.dto';
import { GlassType } from '../entities/glass-type.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('cocktails')
export class CocktailsController {
  constructor(
    private readonly cocktailsService: CocktailsService,
    private readonly glassTypesService: GlassTypesService,
  ) {}

  @Get()
  findAll(@Query() filterDto: FilterCocktailDto): Promise<Cocktail[]> {
    return this.cocktailsService.findAll(filterDto);
  }

  @Get('with-glass-types')
  async findAllWithGlassTypes(@Query() filterDto: FilterCocktailDto): Promise<{
    cocktails: Cocktail[];
    glassTypes: GlassType[];
  }> {
    const [cocktails, glassTypes] = await Promise.all([
      this.cocktailsService.findAll(filterDto),
      this.glassTypesService.findAll(),
    ]);
    return { cocktails, glassTypes };
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

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ReturnType<CocktailsService['findOne']>> {
    const cocktail = await this.cocktailsService.findBySlug(slug);
    
    // If this is a variation (has a parent), get the parent's data
    if (cocktail.parentId) {
      const parentCocktail = await this.cocktailsService.findOne(cocktail.parentId);
      
      // Capitalize the parent cocktail name
      const capitalizedParent = {
        ...parentCocktail.cocktail,
        name: parentCocktail.cocktail.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      };
      
      // Capitalize all variation names
      const capitalizedVariations = parentCocktail.variations
        .filter(v => v.id !== cocktail.id)
        .map(v => ({
          ...v,
          name: v.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        }));
      
      return {
        cocktail,
        potentialAkas: parentCocktail.potentialAkas,
        potentialVariations: parentCocktail.potentialVariations,
        variations: [
          capitalizedParent,
          ...capitalizedVariations
        ]
      };
    }
    
    // If this is a parent, get its variations
    const parentData = await this.cocktailsService.findOne(cocktail.id);
    
    // Capitalize all variation names
    const capitalizedVariations = parentData.variations.map(v => ({
      ...v,
      name: v.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }));
    
    return {
      ...parentData,
      variations: capitalizedVariations
    };
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createCocktailDto: CreateCocktailDto): Promise<Cocktail> {
    return this.cocktailsService.createWithDuplicateCheck(createCocktailDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCocktailDto: UpdateCocktailDto,
  ): Promise<Cocktail> {
    return this.cocktailsService.update(id, updateCocktailDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
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
