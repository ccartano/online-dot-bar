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
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ingredient_entity_1 = require("../entities/ingredient.entity");
let IngredientsService = class IngredientsService {
    constructor(ingredientsRepository) {
        this.ingredientsRepository = ingredientsRepository;
    }
    async findAll() {
        return this.ingredientsRepository.find();
    }
    async findOne(id) {
        return this.ingredientsRepository.findOne({ where: { id } });
    }
    async create(ingredient) {
        const newIngredient = this.ingredientsRepository.create(ingredient);
        return this.ingredientsRepository.save(newIngredient);
    }
    async update(id, ingredient) {
        await this.ingredientsRepository.update(id, ingredient);
        return this.findOne(id);
    }
    async remove(id) {
        await this.ingredientsRepository.delete(id);
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map