import { DataSource } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { GlassType } from '../entities/glass-type.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { Product } from '../entities/product.entity';

async function clearDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE,
    entities: [
      Cocktail,
      CocktailIngredient,
      GlassType,
      Ingredient,
      Product,
    ],
  });

  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      await manager.delete(CocktailIngredient, {});
      await manager.delete(Cocktail, {});
      await manager.delete(GlassType, {});
      await manager.delete(Ingredient, {});
      await manager.delete(Product, {});
    });
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await dataSource.destroy();
  }
}

clearDatabase();
