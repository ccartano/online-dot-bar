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
exports.CocktailIngredient = exports.MeasurementUnit = void 0;
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
var MeasurementUnit;
(function (MeasurementUnit) {
    MeasurementUnit["OZ"] = "oz";
    MeasurementUnit["ML"] = "ml";
    MeasurementUnit["DASH"] = "dash";
    MeasurementUnit["PINCH"] = "pinch";
    MeasurementUnit["PIECE"] = "piece";
    MeasurementUnit["SLICE"] = "slice";
    MeasurementUnit["SPRIG"] = "sprig";
    MeasurementUnit["TWIST"] = "twist";
    MeasurementUnit["WEDGE"] = "wedge";
    MeasurementUnit["OTHER"] = "other";
})(MeasurementUnit || (exports.MeasurementUnit = MeasurementUnit = {}));
let CocktailIngredient = class CocktailIngredient {
};
exports.CocktailIngredient = CocktailIngredient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CocktailIngredient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => index_1.Cocktail, (cocktail) => cocktail.ingredients),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", index_1.Cocktail)
], CocktailIngredient.prototype, "cocktail", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => index_1.Ingredient, (ingredient) => ingredient.cocktails),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", index_1.Ingredient)
], CocktailIngredient.prototype, "ingredient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], CocktailIngredient.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MeasurementUnit,
        default: MeasurementUnit.OTHER,
    }),
    __metadata("design:type", String)
], CocktailIngredient.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CocktailIngredient.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CocktailIngredient.prototype, "order", void 0);
exports.CocktailIngredient = CocktailIngredient = __decorate([
    (0, typeorm_1.Entity)()
], CocktailIngredient);
//# sourceMappingURL=cocktail-ingredient.entity.js.map