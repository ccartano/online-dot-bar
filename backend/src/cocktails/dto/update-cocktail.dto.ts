import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementUnit } from '../../entities/cocktail-ingredient.entity';

export class UpdateCocktailIngredientDto {
  @IsOptional()
  @IsNumber()
  ingredientId?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  unit?: MeasurementUnit;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateCocktailDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsNumber()
  paperlessId?: number;

  @IsOptional()
  @IsNumber()
  glassTypeId?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCocktailIngredientDto)
  ingredients?: UpdateCocktailIngredientDto[];
}
