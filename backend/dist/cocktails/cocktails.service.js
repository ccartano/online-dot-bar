"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocktailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cocktail_entity_1 = require("../entities/cocktail.entity");
let CocktailsService = class CocktailsService {
    constructor(cocktailsRepository) {
        this.cocktailsRepository = cocktailsRepository;
    }
    async findAll() {
        return this.cocktailsRepository.find();
    }
    async findOne(id) {
        return this.cocktailsRepository.findOne({ where: { id } });
    }
    async create(cocktail) {
        const newCocktail = this.cocktailsRepository.create(cocktail);
        return this.cocktailsRepository.save(newCocktail);
    }
    async update(id, cocktail) {
        await this.cocktailsRepository.update(id, cocktail);
        return this.findOne(id);
    }
    async remove(id) {
        await this.cocktailsRepository.delete(id);
    }
};
exports.CocktailsService = CocktailsService;
exports.CocktailsService = CocktailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cocktail_entity_1.Cocktail)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CocktailsService);
//# sourceMappingURL=cocktails.service.js.map