import { PaperlessDocument } from '../../types/paperless.types';
import { Cocktail, GlassType, CocktailIngredient } from '../../types/cocktail.types';
import { MeasurementUnit } from '../../utils/constants';
import { AmericanBartendersHandbookService } from './american-bartenders-handbook.service';
import { EncyclopediaService } from './encyclopedia.service';
import { ParsingUtilsService } from './parsing-utils.service';

export class CocktailParserService {
  private static parseOcrCompleteIngredient(ingredient: string | any, order: number = 0): CocktailIngredient | null {
    // Handle object format with quantity and ingredient properties
    if (typeof ingredient === 'object' && ingredient !== null) {
      console.log('Parsing object ingredient:', ingredient);
      const quantity = ingredient.quantity || '';
      const ingredientName = (ingredient.ingredient || '').toLowerCase();
      
      // Match the amount and unit pattern in the quantity
      const measurementMatch = quantity.match(/^(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\s+or\s+\d+)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|drop|drops)/i);
      console.log('Object measurement match:', measurementMatch);
      
      if (measurementMatch) {
        const [_, amountStr, unitStr] = measurementMatch;
        console.log('Object amount string:', amountStr, 'Unit string:', unitStr);
        
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
      
      // If no measurement found in quantity, return with undefined amount and unit
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

    // Handle string format (existing logic)
    if (typeof ingredient !== 'string') {
      console.error('Invalid ingredient type:', typeof ingredient, ingredient);
      return null;
    }

    console.log('Parsing string ingredient:', ingredient);
    
    // Remove any parenthetical conversions and normalize the text
    const cleanIngredient = ingredient.replace(/\s*\([^)]*\)\s*/, ' ').trim().toLowerCase();
    console.log('Cleaned ingredient:', cleanIngredient);

    // Special case for "Juice of X" measurements
    const juiceOfMatch = cleanIngredient.match(/^juice\s+of\s+(\d+(?:\s+\d+\/\d+)?|\d+\/\d+)\s+(lemon|lime|orange|grapefruit)/i);
    if (juiceOfMatch) {
      const [_, amountStr, fruit] = juiceOfMatch;
      console.log('Juice of match:', { amountStr, fruit });

      // Convert amount to decimal
      let amount: number;
      if (amountStr.includes(' ')) {
        // Mixed number (e.g., "1 1/2")
        const [whole, fraction] = amountStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        amount = Number(whole) + (numerator / denominator);
      } else if (amountStr.includes('/')) {
        // Simple fraction (e.g., "1/2")
        const [numerator, denominator] = amountStr.split('/').map(Number);
        amount = numerator / denominator;
      } else {
        // Simple number
        amount = Number(amountStr);
      }

      const result = {
        order,
        amount,
        unit: MeasurementUnit.WHOLE,
        ingredient: {
          id: -1,
          name: `${fruit} (juiced)`,
          slug: ParsingUtilsService.generateSlug(`${fruit}-juiced`)
        }
      };
      console.log('Final parsed juice of ingredient:', result);
      return result;
    }
    
    // Match the amount and unit pattern (e.g., "1 1/2 oz.", "1 oz.", "1/2 tsp.", "2 or 3 drops")
    const measurementMatch = cleanIngredient.match(/^(\d+(?:\s+\d+\/\d+)?|\d+\/\d+|\d+\s+or\s+\d+)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash|drop|drops)/i);
    console.log('Measurement match:', measurementMatch);
    
    if (measurementMatch) {
      const [_, amountStr, unitStr] = measurementMatch;
      console.log('Amount string:', amountStr, 'Unit string:', unitStr);
      
      // Convert amount to decimal
      let amount: number;
      if (amountStr.includes(' or ')) {
        amount = Number(amountStr.split(' or ')[0]);
        console.log('"or" amount conversion:', amount);
      } else if (amountStr.includes(' ')) {
        const [whole, fraction] = amountStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        amount = Number(whole) + (numerator / denominator);
        console.log('Mixed number conversion:', { whole, fraction, numerator, denominator, result: amount });
      } else if (amountStr.includes('/')) {
        const [numerator, denominator] = amountStr.split('/').map(Number);
        amount = numerator / denominator;
        console.log('Fraction conversion:', { numerator, denominator, result: amount });
      } else {
        amount = Number(amountStr);
        console.log('Simple number conversion:', amount);
      }
      
      const unit = unitStr.toLowerCase().replace('.', '') as MeasurementUnit;
      console.log('Normalized unit:', unit);
      
      const matchLength = measurementMatch[0].length;
      const name = cleanIngredient.slice(matchLength)
        .replace(/^\s*\.\s*/, '')
        .replace(/^\s*s\s*/, '')
        .trim();
      console.log('Extracted ingredient name:', name);
      
      const result = {
        order,
        amount,
        unit,
        ingredient: {
          id: -1,
          name,
          slug: ParsingUtilsService.generateSlug(name)
        }
      };
      console.log('Final parsed ingredient:', result);
      return result;
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
          .map((ing: any, index: number) => {
            // Handle both string and object formats
            if (typeof ing === 'object' && ing !== null) {
              // Object format with quantity and ingredient
              const quantity = ing.quantity || '';
              const ingredientName = (ing.ingredient || '').toLowerCase();
              
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
                
                const unit = unitStr.toLowerCase().replace('.', '') as MeasurementUnit;
                
                return {
                  order: index,
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
                order: index,
                amount: undefined,
                unit: undefined,
                ingredient: {
                  id: -1,
                  name: ingredientName.trim(),
                  slug: ParsingUtilsService.generateSlug(ingredientName.trim())
                }
              };
            } else {
              // String format
              return this.parseOcrCompleteIngredient(ing, index);
            }
          })
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
          tags: ['paperless-gpt-ocr-complete'],
          source: 'paperless-gpt-ocr-complete',
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