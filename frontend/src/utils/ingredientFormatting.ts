import { Cocktail } from '../types/cocktail.types';
import { MeasurementUnit, REVERSE_FRACTION_MAP } from './constants';
import { titleize } from './formatting';
import { plural } from 'pluralize';

// Map of units to their display formats
const UNIT_DISPLAY_MAP: Record<MeasurementUnit, string> = {
  [MeasurementUnit.OZ]: 'oz',
  [MeasurementUnit.ML]: 'ml',
  [MeasurementUnit.DASH]: 'dash',
  [MeasurementUnit.PINCH]: 'pinch',
  [MeasurementUnit.PIECE]: 'piece',
  [MeasurementUnit.SLICE]: 'slice',
  [MeasurementUnit.SPRIG]: 'sprig',
  [MeasurementUnit.TWIST]: 'twist',
  [MeasurementUnit.WEDGE]: 'wedge',
  [MeasurementUnit.TSP]: 'tsp',
  [MeasurementUnit.TBSP]: 'tbsp',
  [MeasurementUnit.SPLASH]: 'splash',
  [MeasurementUnit.PART]: 'part',
  [MeasurementUnit.TO_TASTE]: 'to taste',
  [MeasurementUnit.OTHER]: ''
};

// Helper function to convert decimal to fraction
const decimalToFraction = (decimal: number): string => {
  const fraction = REVERSE_FRACTION_MAP[decimal.toFixed(3)];
  return fraction || decimal.toString();
};

// Helper function to format amount
const formatAmount = (amount: number): string => {
  if (amount === 0.25) return '%';
  if (Number.isInteger(amount)) return amount.toString();
  return decimalToFraction(amount);
};

// Helper function to format unit
const formatUnit = (unit: MeasurementUnit, amount: number): string => {
  const baseUnit = UNIT_DISPLAY_MAP[unit];
  if (!baseUnit) return '';
  
  // Handle pluralization for all units except "to taste"
  if (amount > 1 && unit !== MeasurementUnit.TO_TASTE) {
    return plural(baseUnit);
  }
  
  return baseUnit;
};

export const formatAmountAndUnit = (ingredient: Cocktail['ingredients'][0]) => {
  if (!ingredient.amount && !ingredient.unit) return '';
  if (!ingredient.unit) return ingredient.amount?.toString() || '';
  if (!ingredient.amount) return ingredient.unit;

  const formattedAmount = formatAmount(ingredient.amount);
  const formattedUnit = formatUnit(ingredient.unit, ingredient.amount);

  return `${formattedAmount} ${formattedUnit}`.trim();
};

export const formatIngredientName = (ingredient: Cocktail['ingredients'][0]) => {
  if (!ingredient.ingredient) {
    return '';
  }
  return titleize(ingredient.ingredient.name);
};

export const parseIngredientString = (ingredientString: string): {
  amount: number;
  unit: MeasurementUnit;
  ingredientName: string;
} => {
  // Remove any parenthetical conversions
  const withoutConversions = ingredientString.replace(/\s*\([^)]*\)\s*/, ' ');

  // Match the measurement part (e.g., "2 oz.", "1/2 oz.", "2 dashes")
  const measurementMatch = withoutConversions.match(/^([\d/%]+)\s+([a-zA-Z]+)/);

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
    amount = 0.25;
  } else {
    amount = Number(amountStr);
  }

  // Map unit string to MeasurementUnit
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
    tsp: MeasurementUnit.TSP,
    tbsp: MeasurementUnit.TBSP,
    part: MeasurementUnit.PART,
    'to taste': MeasurementUnit.TO_TASTE
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
}; 