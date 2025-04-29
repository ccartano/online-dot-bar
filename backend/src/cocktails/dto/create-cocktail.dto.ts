import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementUnit } from '../../entities/cocktail-ingredient.entity';

export class CocktailIngredientDto {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  unit?: MeasurementUnit;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  order: number;
}

export class CreateCocktailDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  instructions: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  paperlessId?: number;

  @IsNumber()
  @IsOptional()
  glassTypeId: number | null;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsOptional()
  status?: 'active' | 'pending';

  @IsString()
  @IsOptional()
  source?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CocktailIngredientDto)
  ingredients: CocktailIngredientDto[];
}
