import { Cocktail, MeasurementUnit } from '../services/cocktail.service';
import { titleize } from './formatting';

export const formatAmountAndUnit = (ingredient: Cocktail['ingredients'][0]) => {
  // If there's no amount or unit is OTHER (case-insensitive), return empty string
  if (!ingredient.amount || (ingredient.unit && ingredient.unit.toLowerCase() === MeasurementUnit.OTHER.toLowerCase())) {
    return '';
  }
  
  const amount = ingredient.amount as number;
  let unit = ingredient.unit || MeasurementUnit.OZ; // Provide default value
  
  // Convert ml to oz if needed (case-insensitive comparison)
  if (unit.toLowerCase() === MeasurementUnit.ML.toLowerCase()) {
    // 1 ml = 0.033814 oz
    const convertedAmount = amount * 0.033814;
    unit = MeasurementUnit.OZ;
    
    // Map decimal parts to fraction characters
    const fractionMap: Record<number, string> = {
      0.25: '¼',
      0.33: '⅓',
      0.5: '½',
      0.67: '⅔',
      0.75: '¾'
    };

    // Get the whole number and decimal part
    const wholeNumber = Math.floor(convertedAmount);
    const decimalPart = convertedAmount - wholeNumber;

    // Find the closest fraction for the decimal part
    let closestFraction = '';
    let minDiff = Infinity;
    
    for (const [decimal, fraction] of Object.entries(fractionMap)) {
      const diff = Math.abs(decimalPart - parseFloat(decimal));
      if (diff < minDiff && diff < 0.05) {
        minDiff = diff;
        closestFraction = fraction;
      }
    }

    // If we found a close fraction match, use it
    if (closestFraction) {
      const amountText = wholeNumber ? `${wholeNumber}${closestFraction}` : closestFraction;
      return { amount: amountText, unit: unit.toLowerCase() };
    }

    // If no fraction match, apply rounding rules
    const roundedAmount = Math.round(convertedAmount * 2) / 2; // This will give us .0 or .5
    const roundedDecimalPart = roundedAmount % 1;
    
    let finalAmount = roundedAmount;
    if (roundedDecimalPart > 0.1 && roundedDecimalPart < 0.5) {
      finalAmount = Math.floor(roundedAmount);
    } else if (roundedDecimalPart > 0.5 && roundedDecimalPart < 0.9) {
      finalAmount = Math.ceil(roundedAmount);
    }
    
    return { amount: finalAmount.toString(), unit: unit.toLowerCase() };
  }
  
  // For non-ml units, use the original amount
  const amountNum = typeof amount === 'number' ? amount : parseFloat(amount as string);
  
  // Map decimal parts to fraction characters
  const fractionMap: Record<number, string> = {
    0.25: '¼',
    0.33: '⅓',
    0.5: '½',
    0.67: '⅔',
    0.75: '¾'
  };

  // Get the whole number and decimal part
  const wholeNumber = Math.floor(amountNum);
  const decimalPart = amountNum - wholeNumber;

  // Find the closest fraction for the decimal part
  let closestFraction = '';
  let minDiff = Infinity;
  
  for (const [decimal, fraction] of Object.entries(fractionMap)) {
    const diff = Math.abs(decimalPart - parseFloat(decimal));
    if (diff < minDiff && diff < 0.05) {
      minDiff = diff;
      closestFraction = fraction;
    }
  }

  // If we found a close fraction match, use it
  if (closestFraction) {
    const amountText = wholeNumber ? `${wholeNumber}${closestFraction}` : closestFraction;
    return { amount: amountText, unit: unit.toLowerCase() };
  }
  
  const formattedAmount = Number.isInteger(amountNum) 
    ? amountNum.toString() 
    : amountNum % 0.5 === 0 
      ? amountNum.toString() 
      : Math.round(amountNum).toString();
  const formattedUnit = unit.toLowerCase();
  
  // Handle pluralization for dash
  if (formattedUnit === 'dash' && amountNum > 1) {
    return { amount: formattedAmount, unit: 'dashes' };
  }
  
  return { amount: formattedAmount, unit: formattedUnit };
};

export const formatIngredientName = (ingredient: Cocktail['ingredients'][0]) => {
  if (!ingredient.amount && ingredient.unit && 
      ingredient.unit.toLowerCase() !== MeasurementUnit.OTHER.toLowerCase() &&
      ingredient.unit.toLowerCase() !== MeasurementUnit.OZ.toLowerCase() &&
      ingredient.unit.toLowerCase() !== MeasurementUnit.ML.toLowerCase() &&
      ingredient.unit.toLowerCase() !== 'dash') {
    return `${titleize(ingredient.unit)} of ${titleize(ingredient.ingredient.name)}`;
  }
  return titleize(ingredient.ingredient.name);
}; 