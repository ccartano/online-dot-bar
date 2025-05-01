import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cocktail } from './cocktail.entity';
import { Ingredient } from './ingredient.entity';

// Valid measurement units
export const MEASUREMENT_UNITS = [
  'oz', // ounces
  'ml', // milliliters
  'dash', // for bitters
  'pinch', // for small amounts
  'piece', // for garnishes
  'slice', // for fruit slices
  'sprig', // for herbs
  'twist', // for citrus twists
  'wedge', // for fruit wedges
  'tsp', // teaspoon
  'tbsp', // tablespoon
  'splash', // for small liquid amounts
  'part', // for proportional measurements
  'to taste', // for ingredients that should be added according to personal preference
  'other' // for anything else
] as const;

export type MeasurementUnit = typeof MEASUREMENT_UNITS[number];

@Entity()
export class CocktailIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  // Amount of the ingredient (nullable because some ingredients might not need a specific amount)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  // The unit of measurement
  @Column({ nullable: true, transformer: {
    to: (value: string) => value?.toLowerCase(),
    from: (value: string) => value
  }})
  unit: string;

  // Optional notes about how to use/prepare this ingredient
  @Column({ nullable: true })
  notes: string;

  // Order in which ingredients should be listed/added
  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cocktail, (cocktail) => cocktail.ingredients)
  cocktail: Cocktail;

  @Column()
  cocktailId: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.cocktailIngredients)
  ingredient: Ingredient;

  @Column()
  ingredientId: number;

  /**
   * Parses a cocktail ingredient string into its components
   * @param ingredientString The full ingredient string (e.g., "2 oz. (60 ml/4 tbsp.) dry vermouth")
   * @returns Object containing amount, unit, and ingredient name
   */
  static parseIngredientString(ingredientString: string): {
    amount: number;
    unit: string;
    ingredientName: string;
  } {
    // Remove any parenthetical conversions
    const withoutConversions = ingredientString.replace(/\s*\([^)]*\)\s*/, ' ');

    // Match the measurement part (e.g., "2 oz.", "1/2 oz.", "2 dashes")
    const measurementMatch = withoutConversions.match(
      /^([\d/%]+)\s+([a-zA-Z]+)/,
    );

    if (!measurementMatch) {
      throw new Error(`Invalid ingredient format: ${ingredientString}`);
    }

    const [, amountStr, unitStr] = measurementMatch;

    // Convert amount string to number
    let amount: number;
    if (amountStr.includes('/')) {
      const [numerator, denominator] = amountStr.split('/').map(Number);
      amount = numerator / denominator;
    } else if (amountStr === '%') {
      amount = 0.25; // Assuming % means 1/4
    } else {
      amount = Number(amountStr);
    }

    // Map unit string to valid measurement unit
    const unitMap: Record<string, string> = {
      oz: 'oz',
      dash: 'dash',
      dashes: 'dash',
      ml: 'ml',
      pinch: 'pinch',
      piece: 'piece',
      slice: 'slice',
      sprig: 'sprig',
      twist: 'twist',
      wedge: 'wedge',
      tsp: 'tsp',
      tbsp: 'tbsp',
      part: 'part',
      'to taste': 'to taste'
    };

    const unit = unitMap[unitStr.toLowerCase()] || 'other';

    // Get the ingredient name (everything after the measurement)
    const ingredientName = withoutConversions
      .replace(/^[\d/%]+\s+[a-zA-Z]+\.?\s*/, '')
      .trim();

    return {
      amount,
      unit,
      ingredientName,
    };
  }

  /**
   * Formats the ingredient for display in the edit modal
   * @returns Formatted string with amount, unit, and ingredient name
   */
  formatForDisplay(): string {
    let amountStr: string;
    if (this.amount === 0.25) {
      amountStr = '%';
    } else if (Number.isInteger(this.amount)) {
      amountStr = this.amount.toString();
    } else {
      // Convert decimal to fraction if it's a common fraction
      const fractions: Record<number, string> = {
        0.5: '1/2',
        0.33: '1/3',
        0.67: '2/3',
        0.25: '1/4',
        0.75: '3/4',
      };
      amountStr = fractions[this.amount] || this.amount.toString();
    }

    return `${amountStr} ${this.unit} ${this.ingredient.name}`;
  }
}
