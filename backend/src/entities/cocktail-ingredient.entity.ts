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
}
