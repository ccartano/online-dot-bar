import { 
  mdiGlassCocktail, 
  mdiGlassMug, 
  mdiGlassWine, 
  mdiGlassTulip, 
  mdiGlassFlute, 
  mdiGlassPintOutline, 
  mdiGlassMugVariant,
  mdiGlassStange
} from '@mdi/js';

export interface GlassTypeIcon {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

export const glassTypeIcons: GlassTypeIcon[] = [
  {
    id: 1,
    name: 'Old-Fashioned',
    icon: mdiGlassMug,
    description: 'Short, wide glass for old-fashioned cocktails'
  },
  {
    id: 2,
    name: 'Highball',
    icon: mdiGlassPintOutline,
    description: 'Tall glass for mixed drinks'
  },
  {
    id: 3,
    name: 'Collins/Tumbler',
    icon: mdiGlassPintOutline,
    description: 'Tall, narrow glass for collins drinks'
  },
  {
    id: 4,
    name: 'Shot',
    icon: mdiGlassStange,
    description: 'Small glass for shots'
  },
  {
    id: 5,
    name: 'Colada',
    icon: mdiGlassTulip,
    description: 'Large, curved glass for tropical drinks'
  },
  {
    id: 6,
    name: 'Brandy',
    icon: mdiGlassWine,
    description: 'Wide-bottomed glass for brandy'
  },
  {
    id: 7,
    name: 'Parfait',
    icon: mdiGlassTulip,
    description: 'Tall, narrow glass for layered drinks'
  },
  {
    id: 8,
    name: 'Coffee Liqueur',
    icon: mdiGlassMugVariant,
    description: 'Small glass for coffee-based drinks'
  },
  {
    id: 9,
    name: 'Champagne Flute',
    icon: mdiGlassFlute,
    description: 'Tall, narrow glass for champagne'
  },
  {
    id: 10,
    name: 'Martini/Cocktail',
    icon: mdiGlassCocktail,
    description: 'Classic V-shaped glass for martinis'
  },
  {
    id: 11,
    name: 'Champagne Saucer',
    icon: mdiGlassTulip,
    description: 'Shallow, stemmed glass for champagne'
  },
  {
    id: 12,
    name: 'Goblet/Wine',
    icon: mdiGlassWine,
    description: 'Standard wine glass'
  },
  {
    id: 13,
    name: 'Margarita',
    icon: mdiGlassCocktail,
    description: 'Wide-rimmed glass for margaritas'
  }
]; 