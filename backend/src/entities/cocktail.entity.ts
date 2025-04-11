import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CocktailIngredient, Category, GlassType } from './index';

// The @Entity() decorator tells TypeORM this is a database table
@Entity()
export class Cocktail {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Name of the cocktail
  @Column()
  name: string;

  // Optional description of the cocktail
  @Column({ nullable: true })
  description: string;

  // Instructions for making the cocktail (using text type for longer content)
  @Column('text')
  instructions: string;

  // Optional URL for an image of the cocktail
  @Column({ nullable: true })
  imageUrl: string;

  // Timestamp for when the cocktail was created
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Timestamp that updates whenever the cocktail is modified
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Optional Paperless document ID for reference
  @Column({ nullable: true })
  paperlessId: number;

  @ManyToOne(() => GlassType)
  @JoinColumn()
  glassType: GlassType;

  @ManyToOne(() => Category)
  @JoinColumn()
  category: Category;

  // This will be our relationship to the ingredients through the junction table
  // We'll set this up properly once we create the CocktailIngredient entity
  @OneToMany(
    () => CocktailIngredient,
    (cocktailIngredient) => cocktailIngredient.cocktail,
  )
  ingredients: CocktailIngredient[];
}
