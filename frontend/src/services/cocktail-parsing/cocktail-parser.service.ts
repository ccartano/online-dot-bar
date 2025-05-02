import { PaperlessDocument } from '../../types/paperless.types';
import { Cocktail, GlassType, CocktailIngredient } from '../../types/cocktail.types';
import { MeasurementUnit } from '../../utils/constants';
import { AmericanBartendersHandbookService } from './american-bartenders-handbook.service';
import { EncyclopediaService } from './encyclopedia.service';
import { ParsingUtilsService } from './parsing-utils.service';

export class CocktailParserService {
  private static parseIngredient(ingredient: string | any, order: number = 0): CocktailIngredient | null {
    // Handle object format with quantity and ingredient properties
    if (typeof ingredient === 'object' && ingredient !== null) {
      console.log('Parsing object ingredient:', ingredient);
      const quantity = ingredient.quantity || '';
      const ingredientName = (ingredient.ingredient || '').toLowerCase();
      
      // First try to match PART measurements
      const partMatch = quantity.match(/^(\d+(?:\.\d+)?)\s*part(s)?\s+(.+)/i);
      if (partMatch) {
        return {
          order,
          amount: parseFloat(partMatch[1]),
          unit: MeasurementUnit.PART,
          ingredient: {
            id: -1,
            name: ingredientName.trim(),
            slug: ParsingUtilsService.generateSlug(ingredientName.trim())
          }
        };
      }

      // Special case for "Juice of X" measurements
      const juiceOfMatch = quantity.match(/^juice\s+of\s+(\d+(?:\s+\d+\/\d+)?|\d+\/\d+)\s+(lemon|lime|orange|grapefruit)/i);
      if (juiceOfMatch) {
        const [_, amountStr, fruit] = juiceOfMatch;
        let amount: number;
        if (amountStr.includes(' ')) {
          const [whole, fraction] = amountStr.split(' ');
          const [numerator, denominator] = fraction.split('/').map(Number);
          amount = Number(whole) + (numerator / denominator);
        } else if (amountStr.includes('/')) {
          const [numerator, denominator] = amountStr.split('/').map(Number);
          amount = numerator / denominator;
        } else {
          amount = Number(amountStr);
        }
        return {
          order,
          amount,
          unit: MeasurementUnit.WHOLE,
          ingredient: {
            id: -1,
            name: `${fruit} (juiced)`,
            slug: ParsingUtilsService.generateSlug(`${fruit}-juiced`)
          }
        };
      }
      
      // Match the amount and unit pattern in the quantity
      const measurementMatch = quantity.match(/^(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\s+or\s+\d+)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|drop|drops)/i);
      
      if (measurementMatch) {
        const [_, amountStr, unitStr] = measurementMatch;
        
        // Convert amount to decimal
        let amount: number;
        if (amountStr.includes(' or ')) {
          amount = Number(amountStr.split(' or ')[0]);
        } else if (amountStr.includes(' ')) {
          const [whole, fraction] = amountStr.split(' ');
          const [numerator, denominator] = fraction.split('/').map(Number);
          amount = Number(whole) + (numerator / denominator);
        } else if (amountStr.includes('/')) {
          const [numerator, denominator] = amountStr.split('/').map(Number);
          amount = numerator / denominator;
        } else {
          amount = Number(amountStr);
        }
        
        let unit = unitStr.toLowerCase().replace('.', '') as MeasurementUnit;
        if (!Object.values(MeasurementUnit).map(u => u.toLowerCase()).includes(unit)) {
          console.warn(`Invalid unit detected: ${unit}, defaulting to 'other'`);
          unit = MeasurementUnit.OTHER;
        }
        
        return {
          order,
          amount,
          unit,
          ingredient: {
            id: -1,
            name: ingredientName.trim(),
            slug: ParsingUtilsService.generateSlug(ingredientName.trim())
          }
        };
      }
      
      // If no measurement found, return with undefined amount and unit
      return {
        order,
        amount: undefined,
        unit: undefined,
        ingredient: {
          id: -1,
          name: ingredientName.trim(),
          slug: ParsingUtilsService.generateSlug(ingredientName.trim())
        }
      };
    }

    // Handle string format
    if (typeof ingredient !== 'string') {
      console.error('Invalid ingredient type:', typeof ingredient, ingredient);
      return null;
    }

    console.log('Parsing string ingredient:', ingredient);
    
    // Remove any parenthetical conversions and normalize the text
    const cleanIngredient = ingredient.replace(/\s*\([^)]*\)\s*/, ' ').trim().toLowerCase();
    console.log('Cleaned ingredient:', cleanIngredient);

    // First try to match PART measurements
    const partMatch = cleanIngredient.match(/^(\d+(?:\.\d+)?)\s*part(s)?\s+(.+)/i);
    if (partMatch) {
      return {
        order,
        amount: parseFloat(partMatch[1]),
        unit: MeasurementUnit.PART,
        ingredient: {
          id: -1,
          name: partMatch[3].trim(),
          slug: ParsingUtilsService.generateSlug(partMatch[3].trim())
        }
      };
    }

    // Special case for "Juice of X" measurements
    const juiceOfMatch = cleanIngredient.match(/^juice\s+of\s+(\d+(?:\s+\d+\/\d+)?|\d+\/\d+)\s+(lemon|lime|orange|grapefruit)/i);
    if (juiceOfMatch) {
      const [_, amountStr, fruit] = juiceOfMatch;
      let amount: number;
      if (amountStr.includes(' ')) {
        const [whole, fraction] = amountStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        amount = Number(whole) + (numerator / denominator);
      } else if (amountStr.includes('/')) {
        const [numerator, denominator] = amountStr.split('/').map(Number);
        amount = numerator / denominator;
      } else {
        amount = Number(amountStr);
      }
      return {
        order,
        amount,
        unit: MeasurementUnit.WHOLE,
        ingredient: {
          id: -1,
          name: `${fruit} (juiced)`,
          slug: ParsingUtilsService.generateSlug(`${fruit}-juiced`)
        }
      };
    }
    
    // Match the amount and unit pattern (e.g., "1 1/2 oz.", "1 oz.", "1/2 tsp.", "2 or 3 drops")
    const measurementMatch = cleanIngredient.match(/^(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\s+or\s+\d+)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|drop|drops)/i);
    
    if (measurementMatch) {
      const [_, amountStr, unitStr] = measurementMatch;
      
      // Convert amount to decimal
      let amount: number;
      if (amountStr.includes(' or ')) {
        amount = Number(amountStr.split(' or ')[0]);
      } else if (amountStr.includes(' ')) {
        const [whole, fraction] = amountStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        amount = Number(whole) + (numerator / denominator);
      } else if (amountStr.includes('/')) {
        const [numerator, denominator] = amountStr.split('/').map(Number);
        amount = numerator / denominator;
      } else {
        amount = Number(amountStr);
      }
      
      const unit = unitStr.toLowerCase().replace('.', '') as MeasurementUnit;
      
      const matchLength = measurementMatch[0].length;
      const name = cleanIngredient.slice(matchLength)
        .replace(/^\s*\.\s*/, '')
        .replace(/^\s*s\s*/, '')
        .trim();
      
      return {
        order,
        amount,
        unit,
        ingredient: {
          id: -1,
          name,
          slug: ParsingUtilsService.generateSlug(name)
        }
      };
    }

    // Handle ingredients without measurements
    console.log('No measurement found, treating as ingredient without measurement');
    return {
      order,
      amount: undefined,
      unit: undefined,
      ingredient: {
        id: -1,
        name: cleanIngredient,
        slug: ParsingUtilsService.generateSlug(cleanIngredient)
      }
    };
  }

  private static parseJsonContent(content: string, docId: number, glassTypes: GlassType[]): Cocktail[] {
    try {
      console.log('Parsing JSON content:', content);
      const data = JSON.parse(content);
      console.log('Parsed JSON data:', data);
      
      const cocktails: Cocktail[] = [];
      
      // Determine source based on tag
      let source = '';
      if (data.tags?.includes('Encyclopedia')) {
        source = 'The Encyclopedia of Cocktails';
      } else if (data.tags?.includes('American Bartenders Handbook')) {
        source = 'American Bartenders Handbook';
      } else if (data.tags?.includes('Bartenders Guide')) {
        source = 'The Official Bartenders Guide';
      }
      
      // Handle both single cocktail and array of cocktails
      const items = Array.isArray(data) ? data : [data];
      console.log('Processing items:', items);
      
      for (const item of items) {
        console.log('Processing item:', item);
        
        if (!item || !Array.isArray(item.ingredients)) {
          console.error('Invalid cocktail format:', item);
          continue;
        }
        
        const glassType = glassTypes.find(gt => 
          ParsingUtilsService.preprocessText(gt.name) === ParsingUtilsService.preprocessText(item.glass)
        );
        console.log('Found glass type:', glassType);
        
        const ingredients = item.ingredients
          .map((ing: any, index: number) => this.parseIngredient(ing, index))
          .filter((ing: CocktailIngredient | null): ing is CocktailIngredient => ing !== null);
        
        console.log('Parsed ingredients:', ingredients);
        
        if (ingredients.length === 0) {
          console.error('No valid ingredients found for cocktail:', item.name);
          continue;
        }
        
        const cocktail = {
          id: -1,
          name: item.name || 'Unnamed Cocktail',
          slug: ParsingUtilsService.generateSlug(item.name || 'unnamed-cocktail'),
          ingredients,
          instructions: item.instructions || '',
          paperlessId: docId,
          status: 'pending' as const,
          tags: data.tags || [],
          source,
          glassTypeId: glassType?.id || null,
          glassType: glassType,
          categoryId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          imageUrl: ''
        };
        console.log('Created cocktail:', cocktail);
        cocktails.push(cocktail);
      }
      
      console.log('Final cocktails array:', cocktails);
      return cocktails;
    } catch (error) {
      console.error('Error parsing JSON content:', error);
      return [];
    }
  }

  static parseCocktailsFromDocuments(documents: PaperlessDocument[], glassTypes: GlassType[] = []): Cocktail[] {
    return documents.flatMap(doc => {
      console.log('Processing document:', doc.id, 'with tags:', doc.tags);
      
      if (doc.tags?.includes('paperless-gpt-ocr-complete')) {
        const jsonMatch = doc.content.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          console.error('No JSON content found in markdown code block');
          return [];
        }
        return this.parseJsonContent(jsonMatch[1], doc.id, glassTypes);
      }
      
      if (doc.tags?.includes('Encyclopedia')) {
        return EncyclopediaService.parseCocktailsFromDocument(doc);
      }
      
      if (doc.tags?.includes('American Bartenders Handbook')) {
        return AmericanBartendersHandbookService.parseCocktailsFromDocuments([doc]);
      }
      
      console.log('No matching tag found for document');
      return [];
    });
  }
} 