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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ingredient = exports.IngredientType = void 0;
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
var IngredientType;
(function (IngredientType) {
    IngredientType["SPIRIT"] = "spirit";
    IngredientType["MIXER"] = "mixer";
    IngredientType["GARNISH"] = "garnish";
    IngredientType["BITTER"] = "bitter";
    IngredientType["SYRUP"] = "syrup";
    IngredientType["OTHER"] = "other";
})(IngredientType || (exports.IngredientType = IngredientType = {}));
let Ingredient = class Ingredient {
};
exports.Ingredient = Ingredient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ingredient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ingredient.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IngredientType,
        default: IngredientType.OTHER,
    }),
    __metadata("design:type", String)
], Ingredient.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ingredient.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => index_1.CocktailIngredient, (cocktailIngredient) => cocktailIngredient.ingredient),
    __metadata("design:type", Array)
], Ingredient.prototype, "cocktails", void 0);
exports.Ingredient = Ingredient = __decorate([
    (0, typeorm_1.Entity)()
], Ingredient);
//# sourceMappingURL=ingredient.entity.js.map