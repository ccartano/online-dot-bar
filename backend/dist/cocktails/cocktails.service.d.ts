import { Repository } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity';
export declare class CocktailsService {
    private cocktailsRepository;
    constructor(cocktailsRepository: Repository<Cocktail>);
    findAll(): Promise<Cocktail[]>;
    findOne(id: number): Promise<Cocktail>;
    create(cocktail: Partial<Cocktail>): Promise<Cocktail>;
    update(id: number, cocktail: Partial<Cocktail>): Promise<Cocktail>;
    remove(id: number): Promise<void>;
}
