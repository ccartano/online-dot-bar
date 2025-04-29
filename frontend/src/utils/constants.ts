export const FRACTION_MAP: Record<string, string> = {
  '¼': '.25',
  '½': '.5',
  '¾': '.75',
  '⅓': '.333',
  '⅔': '.666',
  '⅕': '.2',
  '⅖': '.4',
  '⅗': '.6',
  '⅘': '.8',
  '⅙': '.166',
  '⅚': '.833',
  '⅛': '.125',
  '⅜': '.375',
  '⅝': '.625',
  '⅞': '.875'
};

export const REVERSE_FRACTION_MAP: Record<string, string> = {
  '.25': '¼',
  '.5': '½',
  '.75': '¾',
  '.333': '⅓',
  '.666': '⅔',
  '.2': '⅕',
  '.4': '⅖',
  '.6': '⅗',
  '.8': '⅘',
  '.166': '⅙',
  '.833': '⅚',
  '.125': '⅛',
  '.375': '⅜',
  '.625': '⅝',
  '.875': '⅞'
};

export const ML_TO_OZ_RATIO = 0.033814; 

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
  TSP = 'tsp', // teaspoon
  TBSP = 'tbsp', // tablespoon
  SPLASH = 'splash', // for small liquid amounts
  PART = 'part', // for proportional measurements
  TO_TASTE = 'to taste', // for ingredients that should be added according to personal preference
  OTHER = 'other' // for anything else
} 

export enum IngredientType {
  SPIRIT = 'spirit',
  LIQUEUR = 'liqueur',
  FORTIFIED_WINE = 'fortified_wine',
  APERITIF_DIGESTIF = 'aperitif_digestif',
  AROMATIC_BITTER = 'aromatic_bitter',
  CITRUS_BITTER = 'citrus_bitter',
  HERBAL_BITTER = 'herbal_bitter',
  CARBONATED_MIXER = 'carbonated_mixer',
  JUICE = 'juice',
  DAIRY = 'dairy',
  HOT_BEVERAGE = 'hot_beverage',
  SIMPLE_SYRUP = 'simple_syrup',
  FLAVORED_SYRUP = 'flavored_syrup',
  SPECIALTY_SYRUP = 'specialty_syrup',
  FRUIT_GARNISH = 'fruit_garnish',
  HERB_GARNISH = 'herb_garnish',
  SPICE_GARNISH = 'spice_garnish',
  OTHER_GARNISH = 'other_garnish',
  WINE = 'wine',
  ENHANCERS = 'enhancers',
  OTHER = 'other',
}

export const INGREDIENT_TYPE_LABELS: Record<IngredientType, string> = {
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