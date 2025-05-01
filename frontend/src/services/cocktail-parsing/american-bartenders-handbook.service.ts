import { PaperlessDocument } from '../../types/paperless.types';
import { Cocktail, CocktailIngredient } from '../../types/cocktail.types';
import { ParsingUtilsService } from './parsing-utils.service';

export class AmericanBartendersHandbookService {
  static parseCocktailFromDocument(doc: PaperlessDocument): Cocktail | null {
    const lines = doc.content.split('\n')
      .map(line => ParsingUtilsService.preprocessText(line))
      .filter(line => line);
    
    if (lines.length < 2) {
      return null;
    }

    const name = lines[0];
    let instructions = '';
    const ingredients: CocktailIngredient[] = [];

    // Parse ingredients and instructions according to American Bartender's Handbook format
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Check if the line contains instruction-like content
      if (line.includes('pour') || 
          line.includes('add') || 
          line.includes('stir') || 
          line.includes('strain') ||
          line.includes('shake') ||
          line.includes('into') ||
          line.includes('fill') ||
          line.includes('serve') ||
          line.includes('squeeze')) {
        // Add this line to the instructions with proper spacing
        if (instructions) {
          instructions += ' ' + line;
        } else {
          instructions = line;
        }
        continue;
      }

      // Handle asterisk case by removing it before parsing
      const cleanLine = line.replace(/^\*\s*/, '');
      const parsedIngredient = ParsingUtilsService.parseStringIngredient(cleanLine);
      
      if (parsedIngredient) {
        ingredients.push(parsedIngredient);
      } else {
        // If parsing failed, try to suggest a unit based on the ingredient name
        const ingredientName = cleanLine
          .replace(/^\s*\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)\.?\s*(?:\([^)]*\))?\s*/, '')
          .replace(/=\s*/g, '')
          .replace(/\s*\([^)]*\)/g, '')
          .replace(/\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)/g, '')
          .replace(/\s*(?:oz|02|0z|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)\.?\s*/g, ' ')
          .replace(/[^a-z\u00C0-\u00FF\u0100-\u017F\u0180-\u024F\s-]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/^\s*of\s+/, '')
          .replace(/^es\s+/, '')  // Remove 'es' at the beginning
          .replace(/^s\s+/, '')   // Remove 's' at the beginning
          .trim();

        if (ingredientName && ingredientName.length > 2) {
          const unit = ParsingUtilsService.suggestUnit(ingredientName);
          ingredients.push({
            order: ingredients.length + 1,
            amount: undefined,
            unit,
            ingredient: {
              id: -1,
              name: ingredientName,
              slug: ParsingUtilsService.generateSlug(ingredientName)
            }
          });
        }
      }
    }

    return {
      id: doc.id,
      name: ParsingUtilsService.preprocessText(name),
      slug: ParsingUtilsService.generateSlug(name),
      ingredients,
      instructions: ParsingUtilsService.preprocessText(instructions),
      paperlessId: doc.id,
      status: 'pending' as const,
      tags: ['american-bartenders-handbook'],
      description: '',
      imageUrl: '',
      source: 'American Bartenders Handbook',
      glassTypeId: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static parseCocktailsFromDocuments(documents: PaperlessDocument[]): Cocktail[] {
    return documents
      .map(doc => this.parseCocktailFromDocument(doc))
      .filter((cocktail): cocktail is Cocktail => cocktail !== null);
  }
} 