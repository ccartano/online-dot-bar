import { PaperlessDocument } from '../types/paperless.types';
import { Cocktail } from './cocktail.service';
import { AmericanBartendersHandbookService } from './american-bartenders-handbook.service';

export class CocktailParserService {
  static parseCocktailsFromDocuments(documents: PaperlessDocument[]): Cocktail[] {
    return documents.flatMap(doc => {
      // Check if the document has the American Bartender's Handbook tag
      if (doc.tags?.includes('American Bartenders Handbook')) {
        return AmericanBartendersHandbookService.parseCocktailsFromDocuments([doc]);
      }
      return [];
    });
  }
} 