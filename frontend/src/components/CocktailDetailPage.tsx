import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import { Cocktail, MeasurementUnit } from '../services/cocktail.service';
import { getApiUrl } from '../config/api.config';

const titleize = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const sentenceCapitalize = (text: string): string => {
  return text
    .toLowerCase()
    .split('. ')
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
    .join('. ');
};

const convertToFraction = (amount: number): string => {
  // Common fractions and their decimal equivalents
  const fractions: Record<number, string> = {
    0.5: '1/2',
    0.33: '1/3',
    0.67: '2/3',
    0.25: '1/4',
    0.75: '3/4'
  };

  // Check if the amount is close to any of our common fractions
  for (const [decimal, fraction] of Object.entries(fractions)) {
    const decimalValue = parseFloat(decimal);
    if (Math.abs(amount - decimalValue) < 0.01) {
      return fraction;
    }
  }

  // If not a common fraction, return the amount as is
  return amount.toString();
};

export const CocktailDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const response = await fetch(getApiUrl(`/cocktails/${id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch cocktail');
        }
        const data = await response.json();
        setCocktail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCocktail();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!cocktail) {
    return <div className="flex justify-center items-center h-screen">Cocktail not found</div>;
  }

  const formatAmountAndUnit = (ingredient: Cocktail['ingredients'][0]) => {
    if (ingredient.unit === MeasurementUnit.OTHER || !ingredient.amount) {
      return '\u00A0'; // non-breaking space
    }
    
    let amount = ingredient.amount;
    let unit = ingredient.unit;
    
    // Convert ml to oz if needed
    if (unit === MeasurementUnit.ML) {
      amount = amount * (1/30); // 30ml = 1oz
      unit = MeasurementUnit.OZ;
    }
    
    // Format the amount as a fraction
    const formattedAmount = convertToFraction(amount);
    
    return `${formattedAmount} ${unit}`;
  };

  const formatIngredientName = (ingredient: Cocktail['ingredients'][0]) => {
    if (!ingredient.amount && ingredient.unit && ingredient.unit !== MeasurementUnit.OTHER) {
      return `${titleize(ingredient.unit)} ${titleize(ingredient.ingredient.name)}`;
    }
    return titleize(ingredient.ingredient.name);
  };

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Italianno, cursive',
            fontSize: '3rem',
            color: '#1a1a1a'
          }}
        >
          {titleize(cocktail.name)}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
          Ingredients
        </Typography>
        <List>
          {[...cocktail.ingredients]
            .sort((a, b) => {
              // Sort ingredients with amounts to the top
              if (a.amount && !b.amount) return -1;
              if (!a.amount && b.amount) return 1;
              return 0;
            })
            .map((ingredient, index) => (
            <ListItem key={index} sx={{ py: 0, display: 'flex', width: '100%', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex',
                width: '250px',
                alignItems: 'center'
              }}>
                <div style={{ 
                  fontFamily: 'Italianno, cursive',
                  fontSize: '2rem',
                  lineHeight: 1,
                  width: 'fit-content'
                }}>
                  {formatAmountAndUnit(ingredient)}
                </div>
                {ingredient.amount && (
                  <div style={{ 
                    lineHeight: 1,
                    color: '#ccc',
                    textAlign: 'left',
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    ................................................
                  </div>
                )}
              </div>
              <div style={{ lineHeight: 1, minWidth: '200px', marginLeft: '4px' }}>
                {formatIngredientName(ingredient)}
              </div>
            </ListItem>
          ))}
          {cocktail.glassType?.name && (
            <ListItem sx={{ py: 0, display: 'flex', width: '100%', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex',
                width: '250px',
                alignItems: 'center'
              }}>
                <div style={{ 
                  fontFamily: 'Italianno, cursive',
                  fontSize: '2rem',
                  lineHeight: 1,
                  width: 'fit-content'
                }}>
                  Glass Type
                </div>
                <div style={{ 
                  lineHeight: 1,
                  color: '#ccc',
                  textAlign: 'left',
                  flex: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  ................................................
                </div>
              </div>
              <div style={{ lineHeight: 1, minWidth: '200px', marginLeft: '4px' }}>
                {titleize(cocktail.glassType.name)}
              </div>
            </ListItem>
          )}
        </List>
      </Box>

      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
          Instructions
        </Typography>
        <p style={{ whiteSpace: 'pre-line' }}>
          {sentenceCapitalize(cocktail.instructions)}
        </p>
      </Box>
    </Box>
  );
}; 