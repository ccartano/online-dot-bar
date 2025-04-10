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
exports.CocktailsController = void 0;
const common_1 = require("@nestjs/common");
const cocktails_service_1 = require("./cocktails.service");
let CocktailsController = class CocktailsController {
    constructor(cocktailsService) {
        this.cocktailsService = cocktailsService;
    }
    findAll() {
        return this.cocktailsService.findAll();
    }
    findOne(id) {
        return this.cocktailsService.findOne(+id);
    }
    create(cocktail) {
        return this.cocktailsService.create(cocktail);
    }
    update(id, cocktail) {
        return this.cocktailsService.update(+id, cocktail);
    }
    remove(id) {
        return this.cocktailsService.remove(+id);
    }
};
exports.CocktailsController = CocktailsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CocktailsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CocktailsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CocktailsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CocktailsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CocktailsController.prototype, "remove", null);
exports.CocktailsController = CocktailsController = __decorate([
    (0, common_1.Controller)('cocktails'),
    __metadata("design:paramtypes", [cocktails_service_1.CocktailsService])
], CocktailsController);
//# sourceMappingURL=cocktails.controller.js.map