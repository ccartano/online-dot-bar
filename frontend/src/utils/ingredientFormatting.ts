import { CocktailIngredient } from '../types/cocktail.types';
import { MeasurementUnit, REVERSE_FRACTION_MAP, ML_TO_OZ_RATIO } from './constants';
import { titleize } from './formatting';
import { plural } from 'pluralize';

// Helper function to convert ML to OZ
const convertMlToOz = (ml: number): number => {
  // Convert to OZ and round to 1 decimal place
  const oz = ml * ML_TO_OZ_RATIO;
  // Round to nearest quarter (0.25) for cleaner fractions
  return Math.round(oz * 4) / 4;
};

// Helper function to convert decimal to fraction
const decimalToFraction = (decimal: number): string => {
  // First try exact matches with decimal point
  const decimalStr = decimal.toString();
  const fraction = REVERSE_FRACTION_MAP[decimalStr];
  if (fraction) return fraction;

  // Then try with decimal point removed
  const fractionWithoutPoint = REVERSE_FRACTION_MAP[decimalStr.replace('0.', '.')];
  if (fractionWithoutPoint) return fractionWithoutPoint;

  // Then try with 3 decimal places
  const decimalStr3 = decimal.toFixed(3);
  const fraction3 = REVERSE_FRACTION_MAP[decimalStr3];
  if (fraction3) return fraction3;

  // If no match, return the decimal
  return decimal.toString();
};

// Helper function to format amount
const formatAmount = (amount: number): string => {
  if (amount === 0.25) return '%';
  if (Number.isInteger(amount)) return amount.toString();
  
  // Handle mixed numbers (e.g., 1.5 -> 1½)
  const whole = Math.floor(amount);
  const fraction = amount - whole;
  
  // If we have a whole number and a fraction
  if (whole > 0 && fraction > 0) {
    const fractionStr = decimalToFraction(fraction);
    return `${whole}${fractionStr}`;
  }
  
  // If it's just a fraction
  return decimalToFraction(amount);
};

// Helper function to format unit
const formatUnit = (unit: MeasurementUnit, amount: number): string => {
  const normalizedUnit = unit.toLowerCase();
  
  // Don't display "OTHER" unit type
  if (normalizedUnit === MeasurementUnit.OTHER.toLowerCase()) return '';
  
  // Handle pluralization for all units except "to taste"
  if (amount > 1 && normalizedUnit !== MeasurementUnit.TO_TASTE.toLowerCase()) {
    return plural(titleize(unit));
  }
  
  return titleize(unit);
};

export const formatAmountAndUnit = (ingredient: CocktailIngredient) => {
  const normalizedUnit = ingredient.unit?.toLowerCase() ?? '';
  
  // Don't display anything for OTHER unit type
  if (normalizedUnit === MeasurementUnit.OTHER.toLowerCase()) return '';
  
  // Don't display amount/unit for Slice with no amount
  if (normalizedUnit === MeasurementUnit.SLICE.toLowerCase() && !ingredient.amount) return '';
  
  if (!ingredient.amount && !ingredient.unit) return '';
  if (!ingredient.unit) return ingredient.amount?.toString() || '';
  
  // For units like OZ, don't display if there's no amount
  if (!ingredient.amount && [
    MeasurementUnit.OZ.toLowerCase(),
    MeasurementUnit.ML.toLowerCase(),
    MeasurementUnit.TSP.toLowerCase(),
    MeasurementUnit.TBSP.toLowerCase(),
    MeasurementUnit.PIECE.toLowerCase()
  ].includes(normalizedUnit)) {
    return '';
  }
  
  if (!ingredient.amount) return titleize(ingredient.unit);

  // Ensure amount is a number before processing
  const amount = Number(ingredient.amount);
  if (isNaN(amount)) return titleize(ingredient.unit);

  // Convert ML to OZ if needed
  let displayAmount = amount;
  let displayUnit = ingredient.unit;
  
  if (normalizedUnit === MeasurementUnit.ML.toLowerCase()) {
    displayAmount = convertMlToOz(amount);
    displayUnit = MeasurementUnit.OZ;
  }

  const formattedAmount = formatAmount(displayAmount);
  const formattedUnit = formatUnit(displayUnit, displayAmount);

  return `${formattedAmount} ${formattedUnit}`.trim();
};

export const formatIngredientName = (ingredient: CocktailIngredient) => {
  if (!ingredient.ingredient) {
    return '';
  }
  
  const name = titleize(ingredient.ingredient.name);
  const normalizedUnit = ingredient.unit?.toLowerCase();
  
  // Special case for Slice unit with no amount
  if (normalizedUnit === MeasurementUnit.SLICE.toLowerCase() && !ingredient.amount) {
    return `Slice of ${name}`;
  }
  
  return name;
}; 