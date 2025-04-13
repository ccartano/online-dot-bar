import { PaperlessDocument } from '../types/paperless.types';
import { Cocktail, CocktailIngredient, MeasurementUnit } from './cocktail.service';

export class AmericanBartendersHandbookService {
  private static normalizeString(str: string): string {
    return str.trim().toLowerCase();
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
    const instructions = lines[lines.length - 1];
    const ingredients: CocktailIngredient[] = [];

    // Parse ingredients according to American Bartender's Handbook format
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      if (!line) continue;

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
        .trim();

      if (ingredientName && (ingredientName.length > 2 || (value !== undefined && unit !== MeasurementUnit.OTHER))) {
        ingredients.push({
          order: ingredients.length + 1,
          amount: value,
          unit,
          ingredient: {
            name: ingredientName
          }
        });
      }
    }

    return {
      id: doc.id,
      name: this.normalizeString(name),
      ingredients,
      instructions: this.normalizeString(instructions),
      sourceDocumentId: doc.id,
      paperlessId: doc.id,
      status: 'pending',
      tags: ['american-bartenders-handbook']
    };
  }

  static parseCocktailsFromDocuments(documents: PaperlessDocument[]): Cocktail[] {
    return documents
      .map(doc => this.parseCocktailFromDocument(doc))
      .filter((cocktail): cocktail is Cocktail => cocktail !== null);
  }
} 