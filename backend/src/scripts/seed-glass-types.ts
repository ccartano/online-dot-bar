import { DataSource } from 'typeorm';
import { GlassType } from '../entities/glass-type.entity';
import {
  mdiGlassCocktail,
  mdiGlassMug,
  mdiGlassWine,
  mdiGlassTulip,
  mdiGlassFlute,
  mdiGlassPintOutline,
  mdiGlassMugVariant,
  mdiGlassStange,
} from '@mdi/js';

const glassTypes = [
  {
    name: 'Old-Fashioned',
    description: 'Short, wide glass for old-fashioned cocktails',
    icon: mdiGlassMug,
  },
  {
    name: 'Highball',
    description: 'Tall glass for mixed drinks',
    icon: mdiGlassPintOutline,
  },
  {
    name: 'Collins/Tumbler',
    description: 'Tall, narrow glass for collins drinks',
    icon: mdiGlassPintOutline,
  },
  {
    name: 'Shot',
    description: 'Small glass for shots',
    icon: mdiGlassStange,
  },
  {
    name: 'Colada',
    description: 'Large, curved glass for tropical drinks',
    icon: mdiGlassTulip,
  },
  {
    name: 'Brandy',
    description: 'Wide-bottomed glass for brandy',
    icon: mdiGlassWine,
  },
  {
    name: 'Parfait',
    description: 'Tall, narrow glass for layered drinks',
    icon: mdiGlassTulip,
  },
  {
    name: 'Coffee Liqueur',
    description: 'Small glass for coffee-based drinks',
    icon: mdiGlassMugVariant,
  },
  {
    name: 'Champagne Flute',
    description: 'Tall, narrow glass for champagne',
    icon: mdiGlassFlute,
  },
  {
    name: 'Martini/Cocktail',
    description: 'Classic V-shaped glass for martinis',
    icon: mdiGlassCocktail,
  },
  {
    name: 'Champagne Saucer',
    description: 'Shallow, stemmed glass for champagne',
    icon: mdiGlassTulip,
  },
  {
    name: 'Goblet/Wine',
    description: 'Standard wine glass',
    icon: mdiGlassWine,
  },
  {
    name: 'Margarita',
    description: 'Wide-rimmed glass for margaritas',
    icon: mdiGlassCocktail,
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
