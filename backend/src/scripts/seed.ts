import { DataSource } from 'typeorm';
import { seedGlassTypes } from './seed-glass-types';
import { GlassType } from '../entities/glass-type.entity';
import { Cocktail } from '../entities/cocktail.entity';
import { Category } from '../entities/category.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { Ingredient } from '../entities/ingredient.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'calvincartano',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'online_bar',
  entities: [GlassType, Cocktail, Category, CocktailIngredient, Ingredient],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  try {
    await seedGlassTypes(dataSource);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
