import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CocktailIngredient } from './cocktail-ingredient.entity';

// This enum defines the different types of ingredients we can have
export enum IngredientType {
  SPIRIT = 'spirit', // e.g., vodka, gin, whiskey
  LIQUEUR = 'liqueur', // e.g., Cointreau, Campari, Chartreuse
  FORTIFIED_WINE = 'fortified_wine', // e.g., Port, Vermouth, Dubonnet
  APERITIF_DIGESTIF = 'aperitif_digestif', // e.g., Campari, Aperol, Fernet
  AROMATIC_BITTER = 'aromatic_bitter', // e.g., Angostura
  CITRUS_BITTER = 'citrus_bitter', // e.g., Orange, Peychaud's
  HERBAL_BITTER = 'herbal_bitter', // e.g., Celery, Lavender
  CARBONATED_MIXER = 'carbonated_mixer', // e.g., club soda, ginger ale
  JUICE = 'juice', // e.g., fruit juices
  DAIRY = 'dairy', // e.g., cream, milk
  HOT_BEVERAGE = 'hot_beverage', // e.g., coffee, tea
  SIMPLE_SYRUP = 'simple_syrup', // e.g., gomme syrup, sugar syrup
  FLAVORED_SYRUP = 'flavored_syrup', // e.g., grenadine, fruit syrups
  SPECIALTY_SYRUP = 'specialty_syrup', // e.g., orgeat, falernum
  FRUIT_GARNISH = 'fruit_garnish', // e.g., citrus wedges, berries
  HERB_GARNISH = 'herb_garnish', // e.g., mint, basil
  SPICE_GARNISH = 'spice_garnish', // e.g., nutmeg, cinnamon
  OTHER_GARNISH = 'other_garnish', // e.g., edible flowers, salt rim
  WINE = 'wine',
  ENHANCERS = 'enhancers',
  OTHER = 'other', // for anything that doesn't fit above
}

// The @Entity() decorator tells TypeORM this is a database table
@Entity()
export class Ingredient {
  // This creates an auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Basic text column for the ingredient name
  @Column({ unique: true })
  name: string;

  // Slug for URL-friendly ingredient names
  @Column({ unique: true })
  slug: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => CocktailIngredient,
    (cocktailIngredient) => cocktailIngredient.ingredient,
  )
  cocktailIngredients: CocktailIngredient[];

  /**
   * Converts the ingredient type enum value into a human-readable string
   * @returns Human-readable string representation of the ingredient type
   */
  getTypeDisplay(): string {
    const typeMap: Record<IngredientType, string> = {
      [IngredientType.SPIRIT]: 'Spirit',
      [IngredientType.LIQUEUR]: 'Liqueur',
      [IngredientType.FORTIFIED_WINE]: 'Fortified Wine',
      [IngredientType.APERITIF_DIGESTIF]: 'Aperitif/Digestif',
      [IngredientType.AROMATIC_BITTER]: 'Aromatic Bitter',
      [IngredientType.CITRUS_BITTER]: 'Citrus Bitter',
      [IngredientType.HERBAL_BITTER]: 'Herbal Bitter',
      [IngredientType.CARBONATED_MIXER]: 'Carbonated Mixer',
      [IngredientType.JUICE]: 'Juice',
      [IngredientType.DAIRY]: 'Dairy',
      [IngredientType.HOT_BEVERAGE]: 'Hot Beverage',
      [IngredientType.SIMPLE_SYRUP]: 'Simple Syrup',
      [IngredientType.FLAVORED_SYRUP]: 'Flavored Syrup',
      [IngredientType.SPECIALTY_SYRUP]: 'Specialty Syrup',
      [IngredientType.FRUIT_GARNISH]: 'Fruit Garnish',
      [IngredientType.HERB_GARNISH]: 'Herb Garnish',
      [IngredientType.SPICE_GARNISH]: 'Spice Garnish',
      [IngredientType.OTHER_GARNISH]: 'Other Garnish',
      [IngredientType.WINE]: 'Wine',
      [IngredientType.ENHANCERS]: 'Enhancers',
      [IngredientType.OTHER]: 'Other',
    };

    return typeMap[this.type] || 'Other';
  }

  /**
   * Gets all ingredient types in a format suitable for a dropdown list
   * @returns Array of objects with value and label properties
   */
  static getTypeOptions(): Array<{ value: IngredientType; label: string }> {
    const typeMap: Record<IngredientType, string> = {
      [IngredientType.SPIRIT]: 'Spirit',
      [IngredientType.LIQUEUR]: 'Liqueur',
      [IngredientType.FORTIFIED_WINE]: 'Fortified Wine',
      [IngredientType.APERITIF_DIGESTIF]: 'Aperitif/Digestif',
      [IngredientType.AROMATIC_BITTER]: 'Aromatic Bitter',
      [IngredientType.CITRUS_BITTER]: 'Citrus Bitter',
      [IngredientType.HERBAL_BITTER]: 'Herbal Bitter',
      [IngredientType.CARBONATED_MIXER]: 'Carbonated Mixer',
      [IngredientType.JUICE]: 'Juice',
      [IngredientType.DAIRY]: 'Dairy',
      [IngredientType.HOT_BEVERAGE]: 'Hot Beverage',
      [IngredientType.SIMPLE_SYRUP]: 'Simple Syrup',
      [IngredientType.FLAVORED_SYRUP]: 'Flavored Syrup',
      [IngredientType.SPECIALTY_SYRUP]: 'Specialty Syrup',
      [IngredientType.FRUIT_GARNISH]: 'Fruit Garnish',
      [IngredientType.HERB_GARNISH]: 'Herb Garnish',
      [IngredientType.SPICE_GARNISH]: 'Spice Garnish',
      [IngredientType.OTHER_GARNISH]: 'Other Garnish',
      [IngredientType.WINE]: 'Wine',
      [IngredientType.ENHANCERS]: 'Enhancers',
      [IngredientType.OTHER]: 'Other',
    };

    return Object.entries(typeMap).map(([value, label]) => ({
      value: value as IngredientType,
      label,
    }));
  }
}
