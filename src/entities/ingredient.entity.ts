import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CocktailIngredient } from './index';

// This enum defines the different types of ingredients we can have
export enum IngredientType {
  SPIRIT = 'spirit', // e.g., vodka, gin, whiskey
  MIXER = 'mixer', // e.g., tonic, soda, juice
  GARNISH = 'garnish', // e.g., lime, mint, cherry
  BITTER = 'bitter', // e.g., Angostura, Peychaud's
  SYRUP = 'syrup', // e.g., simple syrup, grenadine
  OTHER = 'other', // for anything that doesn't fit above
}

// The @Entity() decorator tells TypeORM this is a database table
@Entity()
export class Ingredient {
  // This creates an auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Basic text column for the ingredient name
  @Column()
  name: string;

  // Optional description of the ingredient
  @Column({ nullable: true })
  description: string;

  // Enum column that uses our IngredientType enum
  @Column({
    type: 'enum',
    enum: IngredientType,
    default: IngredientType.OTHER,
  })
  type: IngredientType;

  // Optional URL for an image of the ingredient
  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(
    () => CocktailIngredient,
    (cocktailIngredient) => cocktailIngredient.ingredient,
  )
  cocktails: CocktailIngredient[];
}
