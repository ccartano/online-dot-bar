import { DataSource } from 'typeorm';
import { GlassType } from '../entities/glass-type.entity';

const glassTypes = [
  {
    name: 'Old-Fashioned',
    description: 'Short, wide glass for old-fashioned cocktails',
  },
  {
    name: 'Highball',
    description: 'Tall glass for mixed drinks',
  },
  {
    name: 'Collins/Tumbler',
    description: 'Tall, narrow glass for collins drinks',
  },
  {
    name: 'Shot',
    description: 'Small glass for shots',
  },
  {
    name: 'Colada',
    description: 'Large, curved glass for tropical drinks',
  },
  {
    name: 'Brandy',
    description: 'Wide-bottomed glass for brandy',
  },
  {
    name: 'Parfait',
    description: 'Tall, narrow glass for layered drinks',
  },
  {
    name: 'Coffee Liqueur',
    description: 'Small glass for coffee-based drinks',
  },
  {
    name: 'Champagne Flute',
    description: 'Tall, narrow glass for champagne',
  },
  {
    name: 'Martini/Cocktail',
    description: 'Classic V-shaped glass for martinis',
  },
  {
    name: 'Champagne Saucer',
    description: 'Shallow, stemmed glass for champagne',
  },
  {
    name: 'Goblet/Wine',
    description: 'Standard wine glass',
  },
  {
    name: 'Margarita',
    description: 'Wide-rimmed glass for margaritas',
  },
];

export async function seedGlassTypes(dataSource: DataSource) {
  const glassTypeRepository = dataSource.getRepository(GlassType);

  // Clear existing glass types
  await glassTypeRepository.delete({});

  // Create new glass types
  for (const glassType of glassTypes) {
    const newGlassType = glassTypeRepository.create(glassType);
    await glassTypeRepository.save(newGlassType);
  }

  console.log('Glass types seeded successfully');
}
