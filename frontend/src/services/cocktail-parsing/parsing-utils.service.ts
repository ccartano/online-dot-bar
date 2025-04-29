import { CocktailIngredient } from '../../types/cocktail.types';
import { MeasurementUnit } from '../../utils/constants';
import { singular } from 'pluralize';
import { FRACTION_MAP } from '../../utils/constants';

export class ParsingUtilsService {
  static preprocessText(text: string | undefined | null): string {
    if (!text) return '';
    return text.toLowerCase().trim();
  }

  static normalizeUnicodeFractions(text: string | undefined | null): string {
    if (!text) return '';
    
    let normalized = text;
    for (const [unicode, decimal] of Object.entries(FRACTION_MAP)) {
      normalized = normalized.replace(new RegExp(unicode, 'g'), decimal);
    }
    return normalized;
  }

  static generateSlug(name: string): string {
    return this.preprocessText(name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '');
  }

  static parseStringIngredient(ingredient: string): CocktailIngredient | null {
    const processedIngredient = this.preprocessText(ingredient);
    if (!processedIngredient) {
      console.error('Empty ingredient string provided');
      return null;
    }

    // First try to match PART measurements
    const partMatch = processedIngredient.match(/^(\d+(?:\.\d+)?)\s*part(s)?\s+(.+)/);
    if (partMatch) {
      return {
        order: 0,
        amount: parseFloat(partMatch[1]),
        unit: MeasurementUnit.PART,
        ingredient: {
          id: -1,
          name: partMatch[3].trim(),
          slug: this.generateSlug(partMatch[3].trim())
        }
      };
    }

    // Check for "to taste" measurements
    const toTasteMatch = processedIngredient.match(/^(to taste)\s+(.+)/i);
    if (toTasteMatch) {
      return {
        order: 0,
        amount: 0,
        unit: MeasurementUnit.TO_TASTE,
        ingredient: {
          id: -1,
          name: toTasteMatch[2].trim(),
          slug: this.generateSlug(toTasteMatch[2].trim())
        }
      };
    }

    // Normalize the text and convert to lowercase
    const normalizedText = this.normalizeUnicodeFractions(processedIngredient)
      .replace(/\b(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|part)\w*\b/g, (match) => {
        return singular(match);
      });

    // Try to match a measurement pattern
    const measurementMatch = normalizedText.match(/^(\d+(?:\.\d+)?|¼|½|¾)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|part)/);
    
    if (measurementMatch) {
      const [_, amountStr, unitStr] = measurementMatch;
      const amount = this.parseAmount(amountStr);
      const unit = this.normalizeUnit(unitStr);
      const name = normalizedText.slice(measurementMatch[0].length).trim();
      
      return {
        order: 0,
        amount,
        unit,
        ingredient: {
          id: -1,
          name,
          slug: this.generateSlug(name)
        }
      };
    }

    // If no measurement found, return default values
    return {
      order: 0,
      amount: 0,
      unit: MeasurementUnit.OTHER,
      ingredient: {
        id: -1,
        name: normalizedText.trim(),
        slug: this.generateSlug(normalizedText.trim())
      }
    };
  }

  private static parseAmount(amountStr: string): number {
    if (amountStr === '¼') return 0.25;
    if (amountStr === '½') return 0.5;
    if (amountStr === '¾') return 0.75;
    return parseFloat(amountStr);
  }

  private static normalizeUnit(unitStr: string): MeasurementUnit {
    const normalizedUnit = unitStr.replace('.', '').toLowerCase();
    switch (normalizedUnit) {
      case 'oz': return MeasurementUnit.OZ;
      case 'ml': return MeasurementUnit.ML;
      case 'dash': return MeasurementUnit.DASH;
      case 'pinch': return MeasurementUnit.PINCH;
      case 'piece': return MeasurementUnit.PIECE;
      case 'slice': return MeasurementUnit.SLICE;
      case 'sprig': return MeasurementUnit.SPRIG;
      case 'twist': return MeasurementUnit.TWIST;
      case 'wedge': return MeasurementUnit.WEDGE;
      case 'tsp': return MeasurementUnit.TSP;
      case 'tbsp': return MeasurementUnit.TBSP;
      case 'splash': return MeasurementUnit.SPLASH;
      case 'part': return MeasurementUnit.PART;
      case 'to taste': return MeasurementUnit.TO_TASTE;
      default: return MeasurementUnit.OTHER;
    }
  }

  static normalizeString(str: string): string {
    return this.preprocessText(str);
  }

  static suggestUnit(ingredientName: string): MeasurementUnit {
    const cleanName = this.preprocessText(ingredientName)
      .replace(/^es\s+/, '')
      .replace(/^s\s+/, '');

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

    if (cleanName.includes('water') || cleanName.includes('soda') || cleanName.includes('tonic') || 
        cleanName.includes('juice') || cleanName.includes('vermouth') || cleanName.includes('wine')) {
      return MeasurementUnit.OZ;
    }

    if (cleanName.includes('garnish') || cleanName.includes('decor')) {
      return MeasurementUnit.PIECE;
    }

    return MeasurementUnit.OZ;
  }
} 