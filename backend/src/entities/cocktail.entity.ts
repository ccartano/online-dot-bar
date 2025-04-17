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
@Entity({ schema: 'online_bar_schema' })
export class Cocktail {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Name of the cocktail
  @Column({ unique: true })
  name: string;

  // Optional description of the cocktail
  @Column({ nullable: true })
  description: string;

  // Instructions for making the cocktail (using text type for longer content)
  @Column({ nullable: true })
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
  @Column({ type: 'int', nullable: true })
  paperlessId: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  glassTypeId: number;

  @ManyToOne(() => GlassType, (glassType) => glassType.cocktails, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'glassTypeId' })
  glassType: GlassType;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.cocktails, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // This will be our relationship to the ingredients through the junction table
  // We'll set this up properly once we create the CocktailIngredient entity
  @OneToMany(
    () => CocktailIngredient,
    (cocktailIngredient) => cocktailIngredient.cocktail,
    { cascade: true },
  )
  ingredients: CocktailIngredient[];

  // New fields for ingredient signatures
  @Column({ type: 'varchar', nullable: true, length: 1024 })
  variationSignature: string | null;

  @Column({ type: 'varchar', nullable: true, length: 2048 })
  akaSignature: string | null;
}
