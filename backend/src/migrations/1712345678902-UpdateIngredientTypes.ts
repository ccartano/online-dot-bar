import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIngredientTypes1712345678902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, create a new enum type with all values
    await queryRunner.query(`
      CREATE TYPE "public"."ingredient_type_enum_new" AS ENUM (
        'spirit', 'liqueur', 'wine', 'fortified_wine', 'aperitif_digestif',
        'aromatic_bitter', 'citrus_bitter', 'herbal_bitter', 'carbonated_mixer',
        'juice', 'dairy', 'hot_beverage', 'simple_syrup', 'flavored_syrup',
        'specialty_syrup', 'fruit_garnish', 'herb_garnish', 'spice_garnish',
        'other_garnish', 'enhancers', 'other'
      );
    `);

    // Drop the old column
    await queryRunner.query(`
      ALTER TABLE "ingredient" DROP COLUMN "type";
    `);

    // Add the new column with the new enum type
    await queryRunner.query(`
      ALTER TABLE "ingredient" 
      ADD COLUMN "type" "public"."ingredient_type_enum_new" NOT NULL DEFAULT 'other';
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE "public"."ingredient_type_enum";
    `);

    // Rename the new enum type to the original name
    await queryRunner.query(`
      ALTER TYPE "public"."ingredient_type_enum_new" RENAME TO "ingredient_type_enum";
    `);

    // Now update the ingredient types
    await queryRunner.query(`
      UPDATE "ingredient"
      SET "type" = CASE
        -- Spirits
        WHEN LOWER(name) IN (
          'gin', 'gold rum', 'navy rum', 'scotch whisky', 'cognac', 'gold tequila',
          'dark rum', 'sloe gin', 'brandy', 'calvados', 'cachaca', 'bacardi',
          'ballantines whiskey', 'bourbon', 'canadian club', 'rye whiskey', 'tequila',
          'vodka', 'white rum', 'beefeater gin', 'dry gin', 'mescal', 'absinthe',
          'akvavit', 'plymouth gin', 'old forester', 'irish whiskey', 'jamaican rum',
          'rum', 'golden rum'
        ) THEN 'spirit'::ingredient_type_enum
        
        -- Liqueurs
        WHEN LOWER(name) IN (
          'benedictine', 'white creme de cacao', 'grand marnier', 'yellow chartreuse',
          'amaretto', 'creme de fraise', 'creme de menthe', 'creme de cacao', 'kahlua',
          'forbidden fruit liqueur', 'brown créme de cacao', 'white creme de menthe',
          'kummel', 'apricot liqueur', 'triple sec', 'apricot brandy', 'white créme de cacao',
          'mandarine napoleon', 'anisette', 'cointreau', 'apple schnapps', 'creme de cassis',
          'green banana liqueur', 'creme de banane', 'pear schnapps', 'galliano',
          'creme de mure', 'melon liqueur', 'peter heering', 'tia maria',
          'midori melon liqueur', 'maraschino liqueur', 'absolut kurant',
          'creme de peche', 'baileys', 'butterscotch schnapps', 'cherry heering',
          'creme de framboise', 'drambuie', 'chambord', 'midori', 'lychee liqueur',
          'pineapple liqueur', 'blue curacao', 'tropical fruit schnapps', 'creme de noix'
        ) THEN 'liqueur'::ingredient_type_enum
        
        -- Fortified Wines
        WHEN LOWER(name) IN (
          'dry vermouth', 'sweet vermouth', 'port', 'dubonnet', 'chambery',
          'ol dry vermouth'
        ) THEN 'fortified_wine'::ingredient_type_enum
        
        -- Aperitifs/Digestifs
        WHEN LOWER(name) IN (
          'campari', 'green chartreuse', 'yellow chartreuse', 'pernod'
        ) THEN 'aperitif_digestif'::ingredient_type_enum
        
        -- Bitters
        WHEN LOWER(name) IN (
          'angostura bitters'
        ) THEN 'aromatic_bitter'::ingredient_type_enum
        WHEN LOWER(name) IN (
          'orange bitters', 'angostura or orange bitters', 'peychaud orange bitters'
        ) THEN 'citrus_bitter'::ingredient_type_enum
        
        -- Carbonated Mixers
        WHEN LOWER(name) IN (
          'club soda', 'ginger ale', 'ginger beer', 'soda water', 'soda'
        ) THEN 'carbonated_mixer'::ingredient_type_enum
        
        -- Juices
        WHEN LOWER(name) IN (
          'fresh lemon juice', 'fresh orange juice', 'grapefruit juice',
          'pineapple juice', 'orange juice', 'cranberry juice', 'fresh lime juice',
          'apple juice', 'lemon juice', 'passion fruit juice', 'pink grapefruit juice',
          'tomato juice', 'carrot juice', 'mango juice', 'unsweetened pineapple juice',
          'juice of half a lime', 'juice of half a lemon', 'juice of lime',
          'juice of one orange', 'fresh juice of one pink grapefruit', 'fresh juice of lime'
        ) THEN 'juice'::ingredient_type_enum
        
        -- Dairy
        WHEN LOWER(name) IN (
          'heavy cream', 'light cream', 'coconut cream', 'coconut milk',
          'sweetened coconut cream', 'whipped cream for topping', 'hot milk'
        ) THEN 'dairy'::ingredient_type_enum
        
        -- Hot Beverages
        WHEN LOWER(name) IN (
          'hot black coffee', 'hot tea', 'hot chocolate'
        ) THEN 'hot_beverage'::ingredient_type_enum
        
        -- Simple Syrups
        WHEN LOWER(name) IN (
          'gomme syrup', 'gorme syrup', 'sugar', 'superfine sugar', 'granulated sugar',
          'raw sugar', 'sugar cube'
        ) THEN 'simple_syrup'::ingredient_type_enum
        
        -- Flavored Syrups
        WHEN LOWER(name) IN (
          'grenadine', 'grenadine syrup', 'blackberry syrup', 'banana syrup',
          'prickly pear cactus syrup'
        ) THEN 'flavored_syrup'
        
        -- Fruit Garnishes
        WHEN LOWER(name) IN (
          'lemon to serve', 'lemon to garnish', 'lime to garnish',
          'red maraschino cherry to garnish', 'maraschino cherry to garnish',
          'orange to garnish', 'raspberry to garnish', 'cherry to garnish',
          'peach to garnish', 'orange spiral to garnish', 'raspberries to garnish'
        ) THEN 'fruit_garnish'
        
        -- Herb Garnishes
        WHEN LOWER(name) IN (
          'thyme to garnish'
        ) THEN 'herb_garnish'
        
        -- Spice Garnishes
        WHEN LOWER(name) IN (
          'nutmeg to garnish', 'cinnamon stick to garnish', 'instant coffee to garnish'
        ) THEN 'spice_garnish'
        
        -- Other Garnishes
        WHEN LOWER(name) IN (
          'ice cubes'
        ) THEN 'other_garnish'
        
        -- Wine
        WHEN LOWER(name) IN (
          'champagne', 'sparkling white wine', 'chilled champagne'
        ) THEN 'wine'
        
        -- Enhancers
        WHEN LOWER(name) IN (
          'egg white', 'half an egg white', 'egg', 'salt', 'salt and black pepper',
          'chili finely chopped', 'white onion finely chopped', 'to es worcestershire sauce',
          'worcestershire sauce', 'thyme', 'rosemary', 'fresh sage leaves',
          'flat leaf parsley', 'honey'
        ) THEN 'enhancers'
        
        ELSE 'other'
      END
      WHERE LOWER(name) IN (
        'champagne', 'gin', 'gold rum', 'gold tequila', 'navy rum', 'orange bitters',
        'scotch whisky', 'cognac', 'benedictine', 'white creme de cacao', 'dry vermouth',
        'fresh lemon juice', 'grand marnier', 'lemon to serve', 'yellow chartreuse',
        'lemon to garnish', 'amaretto', 'gomme syrup', 'club soda', 'fresh orange juice',
        'creme de fraise', 'coconut cream', 'heavy cream', 'strawberries', 'dark rum',
        'sweet vermouth', 'creme de menthe', 'creme de cacao', 'kahlua', 'forbidden fruit liqueur',
        'grapefruit juice', 'pineapple juice', 'brown créme de cacao', 'white creme de menthe',
        'nutmeg to garnish', 'dubonnet', 'sloe gin', 'southern comfort', 'sugar cube',
        'green creme de menthe', 'fresh orange', 'grenadine', 'port', 'hot tea',
        'whipped cream for topping', 'kummel', 'apricot purée', 'angostura bitters',
        'angostura or orange bitters', 'apricot liqueur', 'brandy', 'juice of half a lime',
        'triple sec', 'orange juice', 'sparkling white wine', 'apricot brandy', 'calvados',
        'light cream', 'white créme de cacao', 'mandarine napoleon', 'mandarin juice',
        'anisette', 'water', 'cointreau', 'pernod or dubonnet', 'apple schnapps',
        'cranberry juice', 'fresh lime juice', 'apple juice', 'creme de cassis',
        'cinnamon stick', 'green banana liqueur', 'creme de banane', 'pear schnapps',
        'juice of half a lemon', 'blackcurrant purée', 'lemon juice', 'hot black coffee',
        'raw sugar', 'passion fruit juice', 'lime to garnish', 'peach schnapps',
        'egg white', 'half a banana', 'galliano', 'blackberries', 'creme de mure',
        'gorme syrup', 'cachaca', 'fresh fruit of your choice', 'bacardi',
        'ballantines whiskey', 'blackcurrant vodka', 'bourbon', 'canadian club',
        'chilled champagne', 'half an orange', 'lemon vodka', 'light rum', 'melon liqueur',
        'peychaud orange bitters', 'rye whiskey', 'tequila', 'vodka', 'white rum',
        'peter heering', 'beefeater gin', 'sugar', 'red maraschino cherry to garnish',
        'tia maria', 'midori melon liqueur', 'silver tequila', 'juice of lime',
        'maraschino cherry to garnish', 'a quarter of a of watermelon', 'green chartreuse',
        'thyme to garnish', 'maraschino liqueur', 'unsweetened', 'chunk pineapple',
        'yellow melon', 'absolut kurant', 'roses lime cordial', 'lime juice',
        'orange to garnish', 'ginger ale', 'rum', 'blackberry syrup', 'banana syrup',
        'unsweetened pineapple juice', 'hot chocolate', 'raspberry purée',
        'raspberry to garnish', 'ginger beer', 'campari', 'creme de peche',
        'eight-year-old bacardi', 'passion fruit purée', 'peach peeled and diced',
        'fresh pear purée', 'superfine sugar', 'pimm''s', 'sweetened coconut cream',
        'chunks fresh pineapple', 'salt', 'quarter of a large fresh pineapple',
        'handfuls raspberries', 'juice of one orange', 'ice cubes', 'baileys',
        'butterscotch schnapps', 'dry gin', 'half an egg white', 'soda water',
        'cherry heering', 'creme de framboise', 'pink grapefruit juice',
        'cinnamon stick to garnish', 'half a lime', 'mescal', 'instant coffee to garnish',
        'pernod', 'iced water', 'soda', 'large handfuls raspberries',
        'fresh juice of one pink grapefruit', 'ripe banana', 'fresh juice of lime',
        'drambuie', 'tomato juice', 'salt and black pepper', 'honey',
        'chili finely chopped', 'white onion finely chopped', 'to es worcestershire sauce',
        'absinthe', 'akvavit', 'plymouth gin', 'chambery', 'thyme', 'rosemary',
        'fresh sage leaves', 'flat leaf parsley', 'old forester', 'carrot juice',
        'worcestershire sauce', 'chambord', 'midori', 'grenadine syrup',
        'cherry to garnish', 'juice of maraschino cherries', 'chinaco plata tequila',
        'prickly pear cactus syrup', 'lychee liqueur', 'peach to garnish',
        'fresh peach purée', 'pineapple liqueur', 'rye', 'splash yellow chartreuse',
        'orange spiral to garnish', 'blue curacao', 'tropical fruit schnapps',
        'ol dry vermouth', 'irish whiskey', 'egg', 'hot milk', 'triple sec cointreau',
        'creme de noix', 'half a fresh mango diced', 'jamaican rum', 'granulated sugar',
        'pineapple', 'golden rum', 'coconut milk', 'banana', 'mango juice',
        'half onion finely chopped', 'fresh red chili', 'raspberries',
        'raspberries to garnish'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First revert all updated ingredients back to 'other' type
    await queryRunner.query(`
      UPDATE "ingredient"
      SET "type" = 'other'
      WHERE LOWER(name) IN (
        'champagne', 'gin', 'gold rum', 'gold tequila', 'navy rum', 'orange bitters',
        'scotch whisky', 'cognac', 'benedictine', 'white creme de cacao', 'dry vermouth',
        'fresh lemon juice', 'grand marnier', 'lemon to serve', 'yellow chartreuse',
        'lemon to garnish', 'amaretto', 'gomme syrup', 'club soda', 'fresh orange juice',
        'creme de fraise', 'coconut cream', 'heavy cream', 'strawberries', 'dark rum',
        'sweet vermouth', 'creme de menthe', 'creme de cacao', 'kahlua', 'forbidden fruit liqueur',
        'grapefruit juice', 'pineapple juice', 'brown créme de cacao', 'white creme de menthe',
        'nutmeg to garnish', 'dubonnet', 'sloe gin', 'southern comfort', 'sugar cube',
        'green creme de menthe', 'fresh orange', 'grenadine', 'port', 'hot tea',
        'whipped cream for topping', 'kummel', 'apricot purée', 'angostura bitters',
        'angostura or orange bitters', 'apricot liqueur', 'brandy', 'juice of half a lime',
        'triple sec', 'orange juice', 'sparkling white wine', 'apricot brandy', 'calvados',
        'light cream', 'white créme de cacao', 'mandarine napoleon', 'mandarin juice',
        'anisette', 'water', 'cointreau', 'pernod or dubonnet', 'apple schnapps',
        'cranberry juice', 'fresh lime juice', 'apple juice', 'creme de cassis',
        'cinnamon stick', 'green banana liqueur', 'creme de banane', 'pear schnapps',
        'juice of half a lemon', 'blackcurrant purée', 'lemon juice', 'hot black coffee',
        'raw sugar', 'passion fruit juice', 'lime to garnish', 'peach schnapps',
        'egg white', 'half a banana', 'galliano', 'blackberries', 'creme de mure',
        'gorme syrup', 'cachaca', 'fresh fruit of your choice', 'bacardi',
        'ballantines whiskey', 'blackcurrant vodka', 'bourbon', 'canadian club',
        'chilled champagne', 'half an orange', 'lemon vodka', 'light rum', 'melon liqueur',
        'peychaud orange bitters', 'rye whiskey', 'tequila', 'vodka', 'white rum',
        'peter heering', 'beefeater gin', 'sugar', 'red maraschino cherry to garnish',
        'tia maria', 'midori melon liqueur', 'silver tequila', 'juice of lime',
        'maraschino cherry to garnish', 'a quarter of a of watermelon', 'green chartreuse',
        'thyme to garnish', 'maraschino liqueur', 'unsweetened', 'chunk pineapple',
        'yellow melon', 'absolut kurant', 'roses lime cordial', 'lime juice',
        'orange to garnish', 'ginger ale', 'rum', 'blackberry syrup', 'banana syrup',
        'unsweetened pineapple juice', 'hot chocolate', 'raspberry purée',
        'raspberry to garnish', 'ginger beer', 'campari', 'creme de peche',
        'eight-year-old bacardi', 'passion fruit purée', 'peach peeled and diced',
        'fresh pear purée', 'superfine sugar', 'pimm''s', 'sweetened coconut cream',
        'chunks fresh pineapple', 'salt', 'quarter of a large fresh pineapple',
        'handfuls raspberries', 'juice of one orange', 'ice cubes', 'baileys',
        'butterscotch schnapps', 'dry gin', 'half an egg white', 'soda water',
        'cherry heering', 'creme de framboise', 'pink grapefruit juice',
        'cinnamon stick to garnish', 'half a lime', 'mescal', 'instant coffee to garnish',
        'pernod', 'iced water', 'soda', 'large handfuls raspberries',
        'fresh juice of one pink grapefruit', 'ripe banana', 'fresh juice of lime',
        'drambuie', 'tomato juice', 'salt and black pepper', 'honey',
        'chili finely chopped', 'white onion finely chopped', 'to es worcestershire sauce',
        'absinthe', 'akvavit', 'plymouth gin', 'chambery', 'thyme', 'rosemary',
        'fresh sage leaves', 'flat leaf parsley', 'old forester', 'carrot juice',
        'worcestershire sauce', 'chambord', 'midori', 'grenadine syrup',
        'cherry to garnish', 'juice of maraschino cherries', 'chinaco plata tequila',
        'prickly pear cactus syrup', 'lychee liqueur', 'peach to garnish',
        'fresh peach purée', 'pineapple liqueur', 'rye', 'splash yellow chartreuse',
        'orange spiral to garnish', 'blue curacao', 'tropical fruit schnapps',
        'ol dry vermouth', 'irish whiskey', 'egg', 'hot milk', 'triple sec cointreau',
        'creme de noix', 'half a fresh mango diced', 'jamaican rum', 'granulated sugar',
        'pineapple', 'golden rum', 'coconut milk', 'banana', 'mango juice',
        'half onion finely chopped', 'fresh red chili', 'raspberries',
        'raspberries to garnish'
      );
    `);

    // Create a new enum type with only the original values
    await queryRunner.query(`
      CREATE TYPE "public"."ingredient_type_enum_old" AS ENUM (
        'spirit', 'liqueur', 'wine', 'other'
      );
    `);

    // Drop the current column
    await queryRunner.query(`
      ALTER TABLE "ingredient" DROP COLUMN "type";
    `);

    // Add the column with the old enum type
    await queryRunner.query(`
      ALTER TABLE "ingredient" 
      ADD COLUMN "type" "public"."ingredient_type_enum_old" NOT NULL DEFAULT 'other';
    `);

    // Drop the new enum type
    await queryRunner.query(`
      DROP TYPE "public"."ingredient_type_enum";
    `);

    // Rename the old enum type back to the original name
    await queryRunner.query(`
      ALTER TYPE "public"."ingredient_type_enum_old" RENAME TO "ingredient_type_enum";
    `);
  }
} 