import { DataSource } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
import { GlassType } from '../entities/glass-type.entity';
import { Category } from '../entities/category.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { CocktailIngredient } from '../entities/cocktail-ingredient.entity';
import { AppDataSource } from '../data-source';

async function clearDatabase(dataSource: DataSource) {
  const entities = [
    CocktailIngredient,
    Cocktail,
    Ingredient,
    GlassType,
    Category,
  ];

  try {
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity);
      await repository.delete({});
      console.log(`Cleared ${entity.name} table`);
    }
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Execute the clear database function
AppDataSource.initialize()
  .then(async () => {
    await clearDatabase(AppDataSource);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
    process.exit(1);
  });
