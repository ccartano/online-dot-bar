import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Ingredient,
  Cocktail,
  CocktailIngredient,
  GlassType,
  Category,
} from '../entities';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'calvincartano',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'online_bar',
  entities: [Ingredient, Cocktail, CocktailIngredient, GlassType, Category],
  synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
  logging: process.env.NODE_ENV !== 'production',
};
