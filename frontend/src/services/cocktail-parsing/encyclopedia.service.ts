import { PaperlessDocument } from '../../types/paperless.types';
import { Cocktail } from '../../types/cocktail.types';
import { ParsingUtilsService } from './parsing-utils.service';

export class EncyclopediaService {
  static parseCocktailsFromDocument(doc: PaperlessDocument): Cocktail[] {
    console.log('Parsing encyclopedia document:', doc.id);
    const sections = doc.content.split('---').map(section => section.trim()).filter(Boolean);
    console.log('Found sections:', sections.length);
    const cocktails: Cocktail[] = [];

    for (const section of sections) {
      const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
      let currentCocktail: Partial<Cocktail> = {
        ingredients: [],
        tags: ['encyclopedia'],
        status: 'pending' as const,
        source: 'encyclopedia',
        glassTypeId: null,
        categoryId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let currentSection: 'name' | 'ingredients' | 'instructions' | null = null;
      let instructions: string[] = [];

      for (const line of lines) {
        if (line.startsWith('### ')) {
          const name = line.slice(4).trim();
          console.log('Found cocktail name:', name);
          currentCocktail.name = name;
          currentCocktail.slug = ParsingUtilsService.generateSlug(name);
          currentSection = 'name';
        } else if (line === '**Ingredients:**') {
          currentSection = 'ingredients';
          console.log('Found ingredients section');
        } else if (line === '**Instructions:**') {
          currentSection = 'instructions';
          console.log('Found instructions section');
          instructions = []; // Reset instructions array when we start a new instructions section
        } else if (currentSection === 'ingredients' && line.startsWith('- ')) {
          const ingredientLine = line.slice(2).trim();
          console.log('Parsing ingredient:', ingredientLine);
          const parsedIngredient = ParsingUtilsService.parseStringIngredient(ingredientLine);
          if (parsedIngredient) {
            console.log('Parsed ingredient:', parsedIngredient);
            currentCocktail.ingredients = currentCocktail.ingredients || [];
            currentCocktail.ingredients.push(parsedIngredient);
          }
        } else if (currentSection === 'instructions') {
          // Add the line to instructions if it's not empty and not a section marker
          if (line && !line.startsWith('### ') && !line.startsWith('**')) {
            instructions.push(line);
          }
        }
      }

      if (currentCocktail.name && currentCocktail.ingredients && currentCocktail.ingredients.length > 0) {
        // Join all instruction lines with spaces and trim
        currentCocktail.instructions = instructions.join(' ').trim();
        currentCocktail.paperlessId = doc.id;
        console.log('Created cocktail:', currentCocktail.name, 'with', currentCocktail.ingredients.length, 'ingredients');
        cocktails.push(currentCocktail as Cocktail);
      } else {
        console.log('Skipping cocktail - missing required fields:', {
          hasName: !!currentCocktail.name,
          hasIngredients: !!currentCocktail.ingredients,
          ingredientCount: currentCocktail.ingredients?.length
        });
      }
    }

    console.log('Total cocktails parsed:', cocktails.length);
    return cocktails;
  }

  static parseCocktailsFromDocuments(documents: PaperlessDocument[]): Cocktail[] {
    return documents.flatMap(doc => this.parseCocktailsFromDocument(doc));
  }
} 