import { PaperlessDocument } from '../../types/paperless.types';
import { Cocktail, GlassType, CocktailIngredient } from '../../types/cocktail.types';
import { MeasurementUnit } from '../../utils/constants';
import { AmericanBartendersHandbookService } from './american-bartenders-handbook.service';
import { EncyclopediaService } from './encyclopedia.service';
import { ParsingUtilsService } from './parsing-utils.service';

export class CocktailParserService {
  private static parseJsonIngredient(ingredient: any, order: number = 0): CocktailIngredient | null {
    if (typeof ingredient === 'string') {
      return ParsingUtilsService.parseStringIngredient(ingredient);
    }

    if (!ingredient?.ingredient?.name) {
      console.error('Invalid ingredient format:', ingredient);
      return null;
    }

    const name = ParsingUtilsService.preprocessText(ingredient.ingredient.name);

    // Handle PART measurements
    const partMatch = name.match(/^(\d+)\s+part(s)?\s+(.+)/);
    if (partMatch) {
      return {
        order,
        amount: parseInt(partMatch[1]),
        unit: MeasurementUnit.PART,
        ingredient: {
          id: -1,
          name: partMatch[3].trim(),
          slug: ParsingUtilsService.generateSlug(partMatch[3].trim())
        }
      };
    }

    // Handle SQUEEZE measurements
    const squeezeMatch = name.match(/^(squeeze|squeezes)\s+of\s+(.+)/);
    if (squeezeMatch) {
      return {
        order,
        amount: 1,
        unit: MeasurementUnit.SPLASH,
        ingredient: {
          id: -1,
          name: squeezeMatch[2].trim(),
          slug: ParsingUtilsService.generateSlug(squeezeMatch[2].trim())
        }
      };
    }

    // Handle SPLASH measurements
    const splashMatch = name.match(/^(splash|spash)\s+of\s+(.+)/);
    if (splashMatch) {
      return {
        order,
        amount: 1,
        unit: MeasurementUnit.SPLASH,
        ingredient: {
          id: -1,
          name: splashMatch[2].trim(),
          slug: ParsingUtilsService.generateSlug(splashMatch[2].trim())
        }
      };
    }

    // Handle standard measurements
    const amountMatch = name.match(/^(\d+(?:\.\d+)?)\s*(oz\.?|ml|dash|pinch|piece|slice|sprig|twist|wedge|tsp|tbsp|splash)/);
    if (amountMatch) {
      return {
        order,
        amount: parseFloat(amountMatch[1]),
        unit: amountMatch[2].replace('.', '') as MeasurementUnit,
        ingredient: {
          id: -1,
          name: name.slice(amountMatch[0].length).trim(),
          slug: ParsingUtilsService.generateSlug(name.slice(amountMatch[0].length).trim())
        }
      };
    }

    // If no measurement found, return as OTHER
    return {
      order,
      amount: 0,
      unit: MeasurementUnit.OTHER,
      ingredient: {
        id: -1,
        name: name.trim(),
        slug: ParsingUtilsService.generateSlug(name.trim())
      }
    };
  }

  private static parseJsonCocktail(item: any, docId: number, glassTypes: GlassType[]): Cocktail | null {
    if (!item || !Array.isArray(item.ingredients)) {
      console.error('Invalid cocktail format:', item);
      return null;
    }

    const glassType = glassTypes.find(gt => 
      ParsingUtilsService.preprocessText(gt.name) === ParsingUtilsService.preprocessText(item.glass_type)
    );

    const ingredients = item.ingredients
      .map((ing: any, index: number) => this.parseJsonIngredient(ing, index))
      .filter((ing: CocktailIngredient | null): ing is CocktailIngredient => ing !== null);

    if (ingredients.length === 0) {
      console.error('No valid ingredients found for cocktail:', item.name);
      return null;
    }

    return {
      id: -1, // Temporary ID for new cocktails
      name: item.name || 'Unnamed Cocktail',
      slug: ParsingUtilsService.generateSlug(item.name || 'unnamed-cocktail'),
      ingredients,
      instructions: item.instructions || '',
      paperlessId: docId,
      status: 'pending' as const,
      tags: ['encyclopedia'],
      source: 'encyclopedia',
      glassTypeId: glassType?.id || null,
      glassType: glassType,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '',
      imageUrl: ''
    };
  }

  private static parseJsonContent(content: string, docId: number, glassTypes: GlassType[]): Cocktail[] {
    try {
      const jsonContent = JSON.parse(content);
      if (!Array.isArray(jsonContent)) {
        console.error('JSON content is not an array:', jsonContent);
        return [];
      }

      return jsonContent
        .map(item => this.parseJsonCocktail(item, docId, glassTypes))
        .filter((cocktail): cocktail is Cocktail => cocktail !== null);
    } catch (err) {
      console.error('Error parsing JSON content:', err);
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