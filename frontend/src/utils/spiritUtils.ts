export type BaseSpirit = 'Gin' | 'Whiskey' | 'Vodka' | 'Rum' | 'Tequila' | 'Brandy' | 'Other';

const baseSpirits: Record<string, BaseSpirit> = {
  'gin': 'Gin',
  'whiskey': 'Whiskey',
  'whisky': 'Whiskey',
  'bourbon': 'Whiskey',
  'scotch': 'Whiskey',
  'vodka': 'Vodka',
  'rum': 'Rum',
  'tequila': 'Tequila',
  'brandy': 'Brandy',
  'cognac': 'Brandy'
};

export const getBaseSpirit = (ingredients: { ingredient?: { name: string } }[]): BaseSpirit => {
  for (const ingredient of ingredients) {
    if (!ingredient?.ingredient?.name) continue;
    const lowerName = ingredient.ingredient.name.toLowerCase();
    for (const [spirit, category] of Object.entries(baseSpirits)) {
      if (lowerName.includes(spirit)) {
        return category;
      }
    }
  }
  return 'Other';
}; 