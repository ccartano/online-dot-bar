import { PaperlessDocument } from '../types/paperless.types';

// Match the backend MeasurementUnit enum
export enum MeasurementUnit {
  OZ = 'oz',
  ML = 'ml',
  DASH = 'dash',
  PINCH = 'pinch',
  PIECE = 'piece',
  SLICE = 'slice',
  SPRIG = 'sprig',
  TWIST = 'twist',
  WEDGE = 'wedge',
  OTHER = 'other'
}

export interface CocktailIngredient {
  amount?: string;
  unit?: MeasurementUnit;
  name: string;
}

export interface Cocktail {
  id: number;
  name: string;
  ingredients: CocktailIngredient[];
  instructions: string;
  sourceDocumentId: number;
  paperlessId?: number;
  created?: string;
  glassType?: {
    id: number;
    name: string;
  };
  status: 'active' | 'pending';
}

export class CocktailService {
  private static readonly ML_TO_OZ = 1/30; // 30ml = 1oz

  private static convertMlToOz(ml: number): number {
    return Number((ml * this.ML_TO_OZ).toFixed(2));
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
          value: this.convertMlToOz(mlValue),
          unit: MeasurementUnit.OZ
        };
      }
    }

    // Remove any non-numeric characters except decimal point
    const numericValue = normalizedAmount.replace(/[^\d.]/g, '');
    const value = numericValue ? parseFloat(numericValue) : undefined;

    // Check for ml or milliliters
    if (normalizedAmount.includes('ml') || normalizedAmount.includes('milliliter')) {
      return {
        value: value ? this.convertMlToOz(value) : undefined,
        unit: MeasurementUnit.OZ
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
    const ingredients = lines.slice(1, -1).map(line => {
      // Try to parse amount and unit from the line, handling units with periods and parenthetical measurements
      const match = line.match(/^(%|\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]+\.?)\s*(?:\([^)]*\))?\s+(.+)$/);
      if (match) {
        const amount = this.normalizeString(match[1]);
        const unit = this.normalizeUnit(match[2]);
        const name = this.normalizeString(match[3]);
        
        return {
          amount,
          unit,
          name
        };
      }
      // If no amount/unit found, treat the whole line as the name
      return {
        name: this.normalizeString(line)
      };
    });

    return {
      id: doc.id,
      name: this.normalizeString(name),
      ingredients,
      instructions: this.normalizeString(instructions),
      sourceDocumentId: doc.id,
      paperlessId: doc.id,
      status: 'pending' // Default status for new cocktails
    };
  }

  static parseCocktailsFromDocuments(documents: PaperlessDocument[]): Cocktail[] {
    return documents.map(doc => {
      const lines = doc.content.split('\n');
      const name = lines[0].trim().toLowerCase();
      const ingredients: CocktailIngredient[] = [];
      const instructions: string[] = [];
      let inInstructions = false;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (!line) continue;

        // Check for instruction markers - look for common instruction starters
        if (line.includes('coat') || 
            line.includes('add') || 
            line.includes('float') || 
            line.includes('garnish') || 
            line.includes('shake') || 
            line.includes('stir') || 
            line.includes('serve') ||
            line.includes('pour') ||
            line.includes('mix')) {
          inInstructions = true;
        }

        if (inInstructions) {
          // Add line to instructions if it's not empty and not just a plus sign
          if (line && line !== '+') {
            instructions.push(line);
          }
        } else {
          // Skip lines that are just plus signs or empty
          if (line && line !== '+') {
            // Handle asterisk case by removing it before parsing
            const cleanLine = line.replace(/^\*\s*/, '');
            const { value, unit } = this.parseAmount(cleanLine);
            
            // Improved ingredient name extraction
            const ingredientName = cleanLine
              // Remove the amount and unit at the start (e.g., "1 oz. (30 ml/2 tbsp.)")
              .replace(/^\s*\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge)\.?\s*(?:\([^)]*\))?\s*/, '')
              // Remove equals signs and any remaining parenthetical measurements
              .replace(/=\s*/g, '')
              .replace(/\s*\([^)]*\)/g, '')
              // Remove any remaining numbers or units
              .replace(/\d+\s*(?:oz|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge)/g, '')
              // Remove any remaining unit references (including OCR errors)
              .replace(/\s*(?:oz|02|0z|0z|ounce|ml|milliliter|dash|pinch|piece|slice|sprig|twist|wedge)\.?\s*/g, ' ')
              // Remove any special characters except letters, numbers, and spaces
              .replace(/[^a-z0-9\s]/g, ' ')
              // Clean up any extra spaces
              .replace(/\s+/g, ' ')
              .trim();
            
            // Only add the ingredient if it has a valid name and either:
            // 1. Has an amount and unit, or
            // 2. Has a name longer than 2 characters
            if (ingredientName && 
                (ingredientName.length > 2 || (value !== undefined && unit !== MeasurementUnit.OTHER))) {
              ingredients.push({
                name: ingredientName,
                amount: value?.toString(),
                unit
              });
            }
          }
        }
      }

      return {
        id: doc.id,
        name,
        ingredients,
        instructions: instructions.join('\n').trim(),
        paperlessId: doc.id,
        sourceDocumentId: doc.id,
        status: 'pending' as const
      };
    });
  }
} 