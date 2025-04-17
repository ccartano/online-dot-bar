import { seedGlassTypes } from './seed-glass-types';
import { AppDataSource } from '../data-source';

async function seed() {
  await AppDataSource.initialize();

  try {
    await seedGlassTypes(AppDataSource);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
