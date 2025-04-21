import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreciseIngredientTypes1712345678906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all ingredient types with precise categorization
    await queryRunner.query(`
      UPDATE "ingredient"
      SET "type" = CASE
        -- Spirits (using pattern matching for any ingredient containing spirit-related words)
        WHEN LOWER(name) LIKE '%vodka%' OR
             LOWER(name) LIKE '%whisky%' OR
             LOWER(name) LIKE '%whiskey%' OR
             LOWER(name) LIKE '%gin%' OR
             LOWER(name) LIKE '%rum%' OR
             LOWER(name) LIKE '%tequila%' OR
             LOWER(name) LIKE '%brandy%' OR
             LOWER(name) LIKE '%cognac%' OR
             LOWER(name) LIKE '%pisco%' OR
             LOWER(name) LIKE '%absinthe%' OR
             LOWER(name) LIKE '%akvavit%' OR
             LOWER(name) LIKE '%calvados%' OR
             LOWER(name) LIKE '%cachaca%' OR
             LOWER(name) LIKE '%mescal%' OR
             LOWER(name) LIKE '%schnapps%' OR
             LOWER(name) IN (
          'gin', 'gold rum', 'navy rum', 'scotch whisky', 'cognac', 'gold tequila',
          'dark rum', 'sloe gin', 'brandy', 'calvados', 'cachaca', 'bacardi',
          'ballantines whiskey', 'bourbon', 'canadian club', 'rye whiskey', 'tequila',
          'vodka', 'white rum', 'beefeater gin', 'dry gin', 'mescal', 'absinthe',
          'akvavit', 'plymouth gin', 'old forester', 'irish whiskey', 'jamaican rum',
          'rum', 'golden rum', 'old tom gin', 'spiced rum', 'overproof rum',
          'dutch gin', 'ketel one vodka', 'ol bombay sapphire gin', 'havana white rum',
          'jack daniels', 'chilled dry gin', '100 proof vodka', 'finlandia vodka',
          'black bush', 'genever', 'islay malt whisky', 'advocaat', 'applejack',
          'blackcurrant vodka', 'chinaco plata tequila', 'citrus vodka',
          'cucumber vodka', 'dark puerto rican rum', 'dark rum a', 'gordons gin',
          'gran pisco', 'london dry gin', 'moskovskaya vodka', 'mount gay rum',
          'orange vodka', 'overproof white rum', 'pepper vodka', 'rye',
          'silver tequila', 'vanilla vodka', 'wyborowa vodka',
          'zubrowka bison grass vodka'
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
          'pineapple liqueur', 'blue curacao', 'tropical fruit schnapps', 'creme de noix',
          'southern comfort', 'frangelico', 'limoncello', 'creme de noyeaux',
          'creme yvette', 'cherry schnapps', 'kiwi schnapps', 'black sambuca',
          'ol caravella', 'strawberry schnapps', 'kirsch', 'orange liqueur',
          'creme de noyaux', 'peach brandy', 'strega', 'parfait amour',
          'irish mist', 'orange curacao', 'blue curacao aa', 'absolut pepper vodka',
          '8-year-old bacardi', 'aperol', 'apple sour liqueur', 'baileys irish cream',
          'blackberry liqueur', 'cherry brandy', 'cherry liqueur', 'coffee liqueur',
          'creme de fraises', 'crerne de cacao', 'curacao', 'elixir d''anvers',
          'grand marnier dul', 'hazelnut liqueur', 'irish cream liqueur',
          'kina lillet', 'mandarin liqueur', 'orgeat', 'orgeat syrup', 'pastis',
          'peach schnapps', 'peppermint schnapps', 'poire william', 'schnapps',
          'triple sec cointreau'
        ) THEN 'liqueur'::ingredient_type_enum
        
        -- Fortified Wines
        WHEN LOWER(name) IN (
          'dry vermouth', 'sweet vermouth', 'port', 'dubonnet', 'chambery',
          'ol dry vermouth', 'noilly prat', 'spray of noilly prat', 'lillet blanc',
          'punt e mes', 'dry sherry', 'extra dry vermouth', 'fino sherry',
          'vermouth', 'vermouth rosso'
        ) THEN 'fortified_wine'::ingredient_type_enum
        
        -- Aperitifs/Digestifs
        WHEN LOWER(name) IN (
          'campari', 'green chartreuse', 'yellow chartreuse', 'pernod',
          'cordiale campari', 'aperol'
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
          'club soda', 'ginger ale', 'ginger beer', 'soda water', 'soda',
          'splash of soda water', 'lemon lime soda', 'cola'
        ) THEN 'carbonated_mixer'::ingredient_type_enum
        
        -- Juices (including purees and purées)
        WHEN LOWER(name) LIKE '%juice%' OR
             LOWER(name) LIKE '%puree%' OR
             LOWER(name) LIKE '%purée%' OR
             LOWER(name) IN (
          'fresh lemon juice', 'fresh orange juice', 'grapefruit juice',
          'pineapple juice', 'orange juice', 'cranberry juice', 'fresh lime juice',
          'apple juice', 'lemon juice', 'passion fruit juice', 'pink grapefruit juice',
          'tomato juice', 'carrot juice', 'mango juice', 'unsweetened pineapple juice',
          'juice of half a lime', 'juice of half a lemon', 'juice of lime',
          'juice of one orange', 'fresh juice of one pink grapefruit', 'fresh juice of lime',
          'guava juice', 'fresh pineapple juice', 'papaya juice', 'juice of one lime',
          'juice of half an orange', 'orange juice to taste', 'maraschino juice',
          'hot apple cider', 'cherry purée', 'kiwifruit purée', 'red cherry purée',
          'apple purée', 'mango purée', 'fresh white peach purée', 'passion fruit purée',
          'fresh pear purée', 'blackcurrant purée', 'raspberry purée', 'horseradish purée',
          'fresh peach purée', 'strawberries pulped', 'apricot purée', 'clam juice',
          'clamato juice', 'clear apple juice', 'fresh apple juice', 'fresh grapefruit juice',
          'fresh juice of one lemon', 'fresh juice of one lime', 'fresh juice of one orange',
          'fresh pink grapefruit juice', 'fresh raspberry juice', 'juice of a lime',
          'juice of fresh lime', 'juice of half a ruby orange', 'juice of maraschino cherries',
          'juice of quarter of an orange', 'lemon lime juice', 'lime juice', 'lychee juice',
          'mandarin juice', 'pear juice', 'pulp of one passion fruit', 'white grape juice'
        ) THEN 'juice'::ingredient_type_enum
        
        -- Dairy
        WHEN LOWER(name) IN (
          'heavy cream', 'light cream', 'coconut cream', 'coconut milk',
          'sweetened coconut cream', 'whipped cream for topping', 'hot milk',
          'lassi (indian yogurt drink)', 'noix de coco', 'cream', 'half-and-half',
          'heavy', 'milk', 'steamed milk', 'whipped cream', 'whipping cream'
        ) THEN 'dairy'::ingredient_type_enum
        
        -- Hot Beverages
        WHEN LOWER(name) IN (
          'hot black coffee', 'hot tea', 'hot chocolate', 'black coffee',
          'hot coffee', 'water', 'wineglass boiling water'
        ) THEN 'hot_beverage'::ingredient_type_enum
        
        -- Simple Syrups
        WHEN LOWER(name) IN (
          'gomme syrup', 'gorme syrup', 'sugar', 'superfine sugar', 'granulated sugar',
          'raw sugar', 'sugar cube', 'powdered sugar', 'faw sugar', 'simple syrup',
          'maple syrup', 'brown sugar', 'sugar lumps'
        ) THEN 'simple_syrup'::ingredient_type_enum
        
        -- Flavored Syrups
        WHEN LOWER(name) IN (
          'grenadine', 'grenadine syrup', 'blackberry syrup', 'banana syrup',
          'prickly pear cactus syrup', 'passion fruit syrup', 'candied kumquat nectar',
          'basil syrup', 'orange flower water', 'raspberry syrup', 'lemon sherbet',
          'orgeat syrup', 'roses lime cordial'
        ) THEN 'flavored_syrup'::ingredient_type_enum
        
        -- Fruit Garnishes
        WHEN LOWER(name) IN (
          'lemon to serve', 'lemon to garnish', 'lime to garnish',
          'red maraschino cherry to garnish', 'maraschino cherry to garnish',
          'orange to garnish', 'raspberry to garnish', 'cherry to garnish',
          'peach to garnish', 'orange spiral to garnish', 'raspberries to garnish',
          'strawberries', 'fresh apricots', 'half a ripe banana', 'lime',
          'lemon spiral to garnish', 'quarter of a of watermelon', 'half an orange diced',
          'half yellow pepper', 'half of a banana', 'orange wheel to garnish',
          'kumquat to garnish', 'fraise', 'strawberry to garnish',
          'olive', 'seedless grapes', 'lemon', 'fresh limes', 'medium carrots',
          'fresh apples', 'orange', 'ripe yellow melon diced', 'maraschino cherry',
          'half a fresh mango diced', 'pineapple', 'banana',
          'half an orange', 'a quarter of a of watermelon',
          'chunk pineapple', 'yellow melon', 'peach peeled and diced',
          'chunks fresh pineapple', 'quarter of a large fresh pineapple',
          'handfuls raspberries', 'large handfuls raspberries', 'ripe banana',
          'pineapple to garnish', 'half a lime diced', 'half a lime',
          'half an apple peeled', 'half a pear', 'half a ripe mango diced',
          'blackberries', 'blackberries to garnish', 'blueberries',
          'cherry tomatoes', 'cactus pear diced', 'fresh blueberries',
          'fresh raspberries', 'fruit in season', 'griottine cherries',
          'handful fresh raspberries', 'jalapeno chili to garnish',
          'lemon rind to garnish', 'lemon wheel', 'lime diced',
          'lime spiral to garnish', 'limes', 'mandarin to garnish',
          'maraschino cherry and of lime to garnish',
          'olive stuffed with an almond to garnish', 'olive to garnish',
          'pineapple chunks to garnish', 'raspberries', 'rind of lemon',
          'rind of orange', 'seasonal fruit to garnish',
          'thin grapefruit to garnish'
        ) THEN 'fruit_garnish'::ingredient_type_enum
        
        -- Herb Garnishes
        WHEN LOWER(name) IN (
          'thyme to garnish', 'mint', 'mint leaves', 'of fresh mint',
          'mint to garnish', 'fresh mint leaves', 'stick celery', 'ginger',
          'fresh sage leaves', 'flat leaf parsley', 'rosemary', 'thyme',
          'chopped chives', 'fresh basil leaf', 'fresh chili',
          'fresh ginger', 'fresh lychees', 'fresh red chili'
        ) THEN 'herb_garnish'::ingredient_type_enum
        
        -- Spice Garnishes
        WHEN LOWER(name) IN (
          'nutmeg to garnish', 'cinnamon stick to garnish', 'instant coffee to garnish',
          'grated chocolate to garnish', 'black pepper', 'grated nutmeg to garnish',
          'ground cinnamon to garnish', 'celery salt', 'chocolate shavings to garnish',
          'cinnamon stick', 'cinnamon sticks', 'cloves', 'flamed orange peel to garnish',
          'grated nutmeg to decorate', 'ground coriander', 'ground pepper',
          'shaved chocolate to garnish', 'white pepper'
        ) THEN 'spice_garnish'::ingredient_type_enum
        
        -- Other Garnishes
        WHEN LOWER(name) IN (
          'ice cubes', 'cocktail onion', 'olive or of lemon to garnish',
          'vinegar from cocktail onions', 'cocktail onions to garnish',
          'lemon peel', 'blade of bison grass', 'black olive to garnish',
          'brine from cocktail olives', 'cocktail onion to garnish',
          'garnish with a celery stick and a lime'
        ) THEN 'other_garnish'::ingredient_type_enum
        
        -- Wine
        WHEN LOWER(name) IN (
          'champagne', 'sparkling white wine', 'chilled champagne',
          'dry sparkling wine', 'champagne or prosecco', 'bottle chilled champagne',
          'bottle claret', 'madeira', 'sparkling wine'
        ) THEN 'wine'::ingredient_type_enum
        
        -- Enhancers
        WHEN LOWER(name) IN (
          'egg white', 'half an egg white', 'egg', 'salt', 'salt and black pepper',
          'chili finely chopped', 'white onion finely chopped', 'worcestershire sauce',
          'honey', 'egg yolk', 'tabasco sauce', 'half onion finely chopped',
          'ginger', 'half an onion finely chopped', 'butter', 'egg white powder',
          'horseradish sauce', 'olive infused with vermouth', 'olive oil',
          'splash cranberry juice', 'splash grenadine', 'splash yellow chartreuse',
          'tabasco', 'tomato ketchup', 'white wine vinegar'
        ) THEN 'enhancers'::ingredient_type_enum
        
        ELSE 'other'::ingredient_type_enum
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set all ingredients back to 'other' type
    await queryRunner.query(`
      UPDATE "ingredient"
      SET "type" = 'other'::ingredient_type_enum;
    `);
  }
} 