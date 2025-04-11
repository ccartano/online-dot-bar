import { mdiGlassCocktail, mdiGlassMug, mdiGlassWine, mdiGlassTulip, mdiGlassFlute, mdiGlassPintOutline, mdiGlassMugVariant } from '@mdi/js';

export interface GlassTypeIcon {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

export const glassTypeIcons: GlassTypeIcon[] = [
  {
    id: 1,
    name: 'Highball',
    icon: mdiGlassCocktail,
    description: 'Tall glass for mixed drinks'
  },
  {
    id: 2,
    name: 'Lowball',
    icon: mdiGlassMug,
    description: 'Short glass for spirits and cocktails'
  },
  {
    id: 3,
    name: 'Wine Glass',
    icon: mdiGlassWine,
    description: 'Standard wine glass'
  },
  {
    id: 4,
    name: 'Champagne Flute',
    icon: mdiGlassFlute,
    description: 'Tall, narrow glass for champagne'
  },
  {
    id: 5,
    name: 'Martini Glass',
    icon: mdiGlassTulip,
    description: 'Classic V-shaped glass for martinis'
  },
  {
    id: 6,
    name: 'Coupe',
    icon: mdiGlassTulip,
    description: 'Shallow, stemmed glass'
  },
  {
    id: 7,
    name: 'Pint Glass',
    icon: mdiGlassPintOutline,
    description: 'Standard beer glass'
  },
  {
    id: 8,
    name: 'Shot Glass',
    icon: mdiGlassMugVariant,
    description: 'Small glass for shots'
  }
]; 