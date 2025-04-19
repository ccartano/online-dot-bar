import { GlassType } from '../types/glass.types';

// Keywords that indicate specific glass types
const glassTypeKeywords: Record<string, { exact: string[], partial: string[] }> = {
  'Old-Fashioned': {
    exact: ['old-fashioned glass', 'old fashioned glass', 'rocks glass', 'lowball glass'],
    partial: ['old-fashioned', 'old fashioned', 'rocks', 'lowball']
  },
  'Highball': {
    exact: ['highball glass', 'tall glass'],
    partial: ['highball', 'high ball']
  },
  'Collins/Tumbler': {
    exact: ['collins glass', 'tumbler glass'],
    partial: ['collins', 'tumbler']
  },
  'Shot': {
    exact: ['shot glass', 'shooter glass'],
    partial: ['shot', 'shooter']
  },
  'Colada': {
    exact: ['colada glass', 'pina colada glass', 'hurricane glass'],
    partial: ['colada', 'pina colada', 'hurricane']
  },
  'Brandy': {
    exact: ['brandy glass', 'snifter glass'],
    partial: ['brandy', 'snifter']
  },
  'Parfait': {
    exact: ['parfait glass'],
    partial: ['parfait']
  },
  'Coffee Liqueur': {
    exact: ['coffee glass', 'liqueur glass'],
    partial: ['coffee', 'liqueur']
  },
  'Champagne Flute': {
    exact: ['champagne flute', 'flute glass'],
    partial: ['flute']
  },
  'Martini/Cocktail': {
    exact: ['martini glass', 'cocktail glass', 'coupe glass'],
    partial: ['martini', 'cocktail', 'coupe']
  },
  'Champagne Saucer': {
    exact: ['champagne saucer', 'saucer glass'],
    partial: ['saucer']
  },
  'Goblet/Wine': {
    exact: ['goblet glass', 'wine glass'],
    partial: ['goblet', 'wine']
  },
  'Margarita': {
    exact: ['margarita glass'],
    partial: ['margarita']
  }
};

export function detectGlassTypeFromInstructions(instructions: string, glassTypes: GlassType[]): GlassType | null {
  if (!instructions) return null;

  const lowerInstructions = instructions.toLowerCase();
  
  // Find the glass type with the most matching keywords
  let bestMatch: { glassType: GlassType; score: number } | null = null;

  for (const [glassName, keywords] of Object.entries(glassTypeKeywords)) {
    const glassType = glassTypes.find(gt => gt.name === glassName);
    if (!glassType) continue;

    // First check for exact matches (higher priority)
    const exactScore = keywords.exact.reduce((total, keyword) => {
      return total + (lowerInstructions.includes(keyword) ? 2 : 0);
    }, 0);

    // Then check for partial matches (lower priority)
    const partialScore = keywords.partial.reduce((total, keyword) => {
      return total + (lowerInstructions.includes(keyword) ? 1 : 0);
    }, 0);

    const totalScore = exactScore + partialScore;

    if (totalScore > 0 && (!bestMatch || totalScore > bestMatch.score)) {
      bestMatch = { glassType, score: totalScore };
    }
  }

  return bestMatch?.glassType || null;
} 