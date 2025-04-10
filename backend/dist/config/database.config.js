"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const entities_1 = require("../entities");
exports.databaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'calvincartano',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_bar',
    entities: [entities_1.Ingredient, entities_1.Cocktail, entities_1.CocktailIngredient, entities_1.GlassType, entities_1.Category],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
};
//# sourceMappingURL=database.config.js.map