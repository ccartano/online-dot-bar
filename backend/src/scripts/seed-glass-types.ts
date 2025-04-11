import { DataSource } from 'typeorm';
import { GlassType } from '../entities/glass-type.entity';
import {
  mdiGlassCocktail,
  mdiCup,
  mdiGlassStange,
  mdiGlassWine,
  mdiGlassTulip,
  mdiGlassFlute,
  mdiGlassPintOutline,
} from '@mdi/js';

const glassTypes = [
  {
    name: 'Highball',
    description: 'Tall glass for mixed drinks',
    icon: mdiCup,
  },
  {
    name: 'Lowball',
    description: 'Short glass for spirits and cocktails',
    icon: mdiCup,
  },
  {
    name: 'Wine Glass',
    description: 'Standard wine glass',
    icon: mdiGlassWine,
  },
  {
    name: 'Champagne Flute',
    description: 'Tall, narrow glass for champagne',
    icon: mdiGlassFlute,
  },
  {
    name: 'Martini Glass',
    description: 'Classic V-shaped glass for martinis',
    icon: mdiGlassCocktail,
  },
  {
    name: 'Coupe',
    description: 'Shallow, stemmed glass',
    icon: mdiGlassTulip,
  },
  {
    name: 'Pint Glass',
    description: 'Standard beer glass',
    icon: mdiGlassPintOutline,
  },
  {
    name: 'Shot Glass',
    description: 'Small glass for shots',
    icon: mdiGlassStange,
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
