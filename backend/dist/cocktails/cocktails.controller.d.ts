import { CocktailsService } from './cocktails.service';
import { Cocktail } from '../entities/cocktail.entity';
export declare class CocktailsController {
    private readonly cocktailsService;
    constructor(cocktailsService: CocktailsService);
    findAll(): Promise<Cocktail[]>;
    findOne(id: string): Promise<Cocktail>;
    create(cocktail: Partial<Cocktail>): Promise<Cocktail>;
    update(id: string, cocktail: Partial<Cocktail>): Promise<Cocktail>;
    remove(id: string): Promise<void>;
}
