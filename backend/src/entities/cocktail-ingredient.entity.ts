import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cocktail, Ingredient } from './index';

// Enum for different measurement units
export enum MeasurementUnit {
  OZ = 'oz', // ounces
  ML = 'ml', // milliliters
  DASH = 'dash', // for bitters
  PINCH = 'pinch', // for small amounts
  PIECE = 'piece', // for garnishes
  SLICE = 'slice', // for fruit slices
  SPRIG = 'sprig', // for herbs
  TWIST = 'twist', // for citrus twists
  WEDGE = 'wedge', // for fruit wedges
  OTHER = 'other', // for anything else
}

@Entity()
export class CocktailIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  // Relationship to the Cocktail
  @ManyToOne(() => Cocktail, (cocktail) => cocktail.ingredients)
  @JoinColumn()
  cocktail: Cocktail;

  // Relationship to the Ingredient
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.cocktails)
  @JoinColumn()
  ingredient: Ingredient;

  // Amount of the ingredient (nullable because some ingredients might not need a specific amount)
  @Column({ type: 'float', nullable: true })
  amount: number;

  // The unit of measurement
  @Column({
    type: 'enum',
    enum: MeasurementUnit,
    default: MeasurementUnit.OTHER,
  })
  unit: MeasurementUnit;

  // Optional notes about how to use/prepare this ingredient
  @Column({ nullable: true })
  notes: string;

  // Order in which ingredients should be listed/added
  @Column()
  order: number;

  /**
   * Parses a cocktail ingredient string into its components
   * @param ingredientString The full ingredient string (e.g., "2 oz. (60 ml/4 tbsp.) dry vermouth")
   * @returns Object containing amount, unit, and ingredient name
   */
  static parseIngredientString(ingredientString: string): {
    amount: number;
    unit: MeasurementUnit;
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

    // Map unit string to MeasurementUnit enum
    const unitMap: Record<string, MeasurementUnit> = {
      oz: MeasurementUnit.OZ,
      dash: MeasurementUnit.DASH,
      dashes: MeasurementUnit.DASH,
      ml: MeasurementUnit.ML,
      pinch: MeasurementUnit.PINCH,
      piece: MeasurementUnit.PIECE,
      slice: MeasurementUnit.SLICE,
      sprig: MeasurementUnit.SPRIG,
      twist: MeasurementUnit.TWIST,
      wedge: MeasurementUnit.WEDGE,
    };

    const unit = unitMap[unitStr.toLowerCase()] || MeasurementUnit.OTHER;

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
