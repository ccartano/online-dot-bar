import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
export declare class CategoriesService {
    private categoriesRepository;
    constructor(categoriesRepository: Repository<Category>);
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category>;
    create(category: Partial<Category>): Promise<Category>;
    update(id: number, category: Partial<Category>): Promise<Category>;
    remove(id: number): Promise<void>;
}
