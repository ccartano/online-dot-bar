import { PaperlessDocument } from '../types/paperless.types';
import { Cocktail, CocktailIngredient, MeasurementUnit } from './cocktail.service';

export class AmericanBartendersHandbookService {
  private static normalizeString(str: string): string {
    return str.trim().toLowerCase();
  }

  // Helper function to suggest the best unit based on ingredient name
  private static suggestUnit(ingredientName: string): MeasurementUnit {
    // Remove 'es' or 's' from the beginning of the name
    const cleanName = ingredientName.toLowerCase()
      .replace(/^es\s+/, '')  // Remove 'es' at the beginning
      .replace(/^s\s+/, '');  // Remove 's' at the beginning

    // Check for specific ingredient names
    if (cleanName.includes('bitters')) {
      return MeasurementUnit.DASH;
    }
    if (cleanName.includes('sugar') || cleanName.includes('salt')) {
      return MeasurementUnit.PINCH;
    }
    if (cleanName.includes('juice') || cleanName.includes('soda') || cleanName.includes('tonic')) {
      return MeasurementUnit.OZ;
    }
    if (cleanName.includes('lime') || cleanName.includes('lemon') || cleanName.includes('orange')) {
      if (cleanName.includes('twist') || cleanName.includes('peel')) {
        return MeasurementUnit.TWIST;
      }
      if (cleanName.includes('wedge') || cleanName.includes('slice')) {
        return MeasurementUnit.WEDGE;
      }
    }
    if (cleanName.includes('mint') || cleanName.includes('herb')) {
      return MeasurementUnit.SPRIG;
    }
    if (cleanName.includes('olive') || cleanName.includes('cherry')) {
      return MeasurementUnit.PIECE;
    }

    // Default to ounces for liquids
    if (cleanName.includes('water') || cleanName.includes('soda') || cleanName.includes('tonic') || 
        cleanName.includes('juice') || cleanName.includes('vermouth') || cleanName.includes('wine')) {
      return MeasurementUnit.OZ;
    }

    // Default to pieces for garnishes
    if (cleanName.includes('garnish') || cleanName.includes('decor')) {
      return MeasurementUnit.PIECE;
    }

    // Default to ounces for most other ingredients
    return MeasurementUnit.OZ;
  }

  private static parseAmount(amount: string): { value: number | undefined; unit: MeasurementUnit } {
    // Handle OCR errors by replacing common misreads
    const normalizedAmount = amount
      .replace(/02/g, 'oz')  // Fix OCR error where 'oz' is read as '02'
      .replace(/0z/g, 'oz')  // Fix OCR error where 'oz' is read as '0z'
      .replace(/mI/g, 'ml')  // Fix OCR error where 'ml' is read as 'mI'
      .toLowerCase();

    // Extract the numeric value and unit from parentheses if present
    const parenMatch = normalizedAmount.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const parenContent = parenMatch[1];
      // Try to find ml value first
      const mlMatch = parenContent.match(/(\d+)\s*ml/);
      if (mlMatch) {
        const mlValue = parseFloat(mlMatch[1]);
        return {
          value: mlValue,
          unit: MeasurementUnit.ML
        };
      }
    }

    // Remove any non-numeric characters except decimal point
    const numericValue = normalizedAmount.replace(/[^\d.]/g, '');
    const value = numericValue ? parseFloat(numericValue) : undefined;

    // Check for ml or milliliters
    if (normalizedAmount.includes('ml') || normalizedAmount.includes('milliliter')) {
      return {
        value: value,
        unit: MeasurementUnit.ML
      };
    }

    // Check for other units
    if (normalizedAmount.includes('oz') || normalizedAmount.includes('ounce')) {
      return { value, unit: MeasurementUnit.OZ };
    }
    if (normalizedAmount.includes('dash')) {
      return { value, unit: MeasurementUnit.DASH };
    }
    if (normalizedAmount.includes('pinch')) {
      return { value, unit: MeasurementUnit.PINCH };
    }
    if (normalizedAmount.includes('piece')) {
      return { value, unit: MeasurementUnit.PIECE };
    }
    if (normalizedAmount.includes('slice')) {
      return { value, unit: MeasurementUnit.SLICE };
    }
    if (normalizedAmount.includes('sprig')) {
      return { value, unit: MeasurementUnit.SPRIG };
    }
    if (normalizedAmount.includes('twist')) {
      return { value, unit: MeasurementUnit.TWIST };
    }
    if (normalizedAmount.includes('wedge')) {
      return { value, unit: MeasurementUnit.WEDGE };
    }
    if (normalizedAmount.includes('tsp') || normalizedAmount.includes('teaspoon')) {
      return { value, unit: MeasurementUnit.TSP };
    }
    if (normalizedAmount.includes('tbsp') || normalizedAmount.includes('tablespoon')) {
      return { value, unit: MeasurementUnit.TBSP };
    }

    // If no clear unit is found, return undefined value
    return { value: undefined, unit: MeasurementUnit.OTHER };
  }

  static parseCocktailFromDocument(doc: PaperlessDocument): Cocktail | null {
    const lines = doc.content.split('\n')
      .map(line => this.normalizeString(line))
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
      if (line.toLowerCase().includes('pour') || 
          line.toLowerCase().includes('add') || 
          line.toLowerCase().includes('stir') || 
          line.toLowerCase().includes('strain') ||
          line.toLowerCase().includes('shake') ||
          line.toLowerCase().includes('into') ||
          line.toLowerCase().includes('fill') ||
          line.toLowerCase().includes('serve') ||
          line.toLowerCase().includes('squeeze')) {
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
      const { value, unit } = this.parseAmount(cleanLine);
      
      // Extract ingredient name
      const ingredientName = cleanLine
        .replace(/^\s*\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)\.?\s*(?:\([^)]*\))?\s*/, '')
        .replace(/=\s*/g, '')
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)/g, '')
        .replace(/\s*(?:oz|02|0z|0z|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge|tsp|teaspoon|tbsp|tablespoon)\.?\s*/g, ' ')
        .replace(/[^a-z\u00C0-\u00FF\u0100-\u017F\u0180-\u024F\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^\s*of\s+/, '')
        .replace(/^es\s+/, '')  // Remove 'es' at the beginning
        .replace(/^s\s+/, '')   // Remove 's' at the beginning
        .trim();

      if (ingredientName && (ingredientName.length > 2 || (value !== undefined && unit !== MeasurementUnit.OTHER))) {
        // If no unit was detected, suggest one based on the ingredient name
        const finalUnit = unit === MeasurementUnit.OTHER ? this.suggestUnit(ingredientName) : unit;
        
        // For liquids with no amount, use OTHER instead of OZ
        const isLiquid = ingredientName.toLowerCase().includes('juice') || 
                        ingredientName.toLowerCase().includes('soda') || 
                        ingredientName.toLowerCase().includes('tonic') || 
                        ingredientName.toLowerCase().includes('water') || 
                        ingredientName.toLowerCase().includes('vermouth') || 
                        ingredientName.toLowerCase().includes('wine');
        
        const adjustedUnit = (finalUnit === MeasurementUnit.OZ && isLiquid && value === undefined) 
          ? MeasurementUnit.OTHER 
          : finalUnit;
        
        ingredients.push({
          order: ingredients.length + 1,
          amount: value,
          unit: adjustedUnit,
          ingredient: {
            id: -1, // Temporary ID that will be replaced when saving to the backend
            name: ingredientName,
            slug: this.normalizeString(ingredientName)
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+$/, '') // Remove trailing dashes
          }
        });
      }
    }

    return {
      id: doc.id,
      name: this.normalizeString(name),
      slug: this.normalizeString(name)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+$/, ''), // Remove trailing dashes
      ingredients,
      instructions: this.normalizeString(instructions),
      paperlessId: doc.id,
      status: 'pending' as const,
      tags: ['american-bartenders-handbook'],
      description: '',
      imageUrl: '',
      source: 'American Bartender\'s Handbook',
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