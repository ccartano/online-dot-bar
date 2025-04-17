import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const sentenceCapitalize = (text: string | null | undefined): string => {
  if (!text) {
    return ''; // Return empty string if input is null, undefined, or empty
  }
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

// Define type for the API response
interface CocktailDetailData {
  cocktail: Cocktail;
  potentialAkas: { id: number; name: string }[];
  potentialVariations: { id: number; name: string }[];
}

export const CocktailDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cocktailData, setCocktailData] = useState<CocktailDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const response = await fetch(getApiUrl(`/cocktails/${id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch cocktail');
        }
        const data: CocktailDetailData = await response.json();
        setCocktailData(data);
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

  if (!cocktailData) {
    return <div className="flex justify-center items-center h-screen">Cocktail not found</div>;
  }

  const { cocktail, potentialAkas, potentialVariations } = cocktailData;

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
    <Box sx={{ 
      p: 3, 
      maxWidth: '600px', 
      margin: 'auto',
      minHeight: 'calc(100vh - 64px)', // Account for header height
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Italianno, cursive',
            fontSize: { xs: '2.5rem', sm: '3rem' },
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
              if (a.amount && !b.amount) return -1;
              if (!a.amount && b.amount) return 1;
              return 0;
            })
            .map((ingredient, index) => (
            <ListItem key={index} sx={{ 
              py: 0, 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              gap: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                display: 'flex',
                width: { xs: '100px', sm: '250px' },
                alignItems: 'center',
                gap: 1,
                flexShrink: 0
              }}>
                <Typography sx={{ 
                  fontFamily: 'Italianno, cursive',
                  fontSize: '2rem',
                  lineHeight: 1,
                  minWidth: 'fit-content'
                }}>
                  {formatAmountAndUnit(ingredient)}
                </Typography>
                {ingredient.amount && (
                  <Box sx={{ 
                    flex: 1,
                    lineHeight: 1,
                    color: '#ccc',
                    textAlign: 'left',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0
                  }}>
                    <Box sx={{ 
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {'................................................'.repeat(10)}
                    </Box>
                  </Box>
                )}
              </Box>
              <Box sx={{ 
                lineHeight: 1,
                flex: 1,
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {ingredient.ingredient.id ? (
                  <Link to={`/ingredients/${ingredient.ingredient.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {formatIngredientName(ingredient)}
                  </Link>
                ) : (
                  formatIngredientName(ingredient)
                )}
              </Box>
            </ListItem>
          ))}
          {cocktail.glassType?.name && (
            <ListItem sx={{ 
              py: 0, 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              gap: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                display: 'flex',
                width: { xs: '100px', sm: '250px' },
                alignItems: 'center',
                gap: 1,
                flexShrink: 0
              }}>
                <Typography sx={{ 
                  fontFamily: 'Italianno, cursive',
                  fontSize: '2rem',
                  lineHeight: 1,
                  minWidth: 'fit-content'
                }}>
                  Glass Type
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  lineHeight: 1,
                  color: '#ccc',
                  textAlign: 'left',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0
                }}>
                  <Box sx={{ 
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {'................................................'.repeat(10)}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ 
                lineHeight: 1,
                flex: 1,
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {titleize(cocktail.glassType.name)}
              </Box>
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
          Instructions
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-line' }}>
          {sentenceCapitalize(cocktail.instructions)}
        </Typography>
      </Box>

      {potentialAkas && potentialAkas.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
            Also Known As
          </Typography>
          <List dense>
            {potentialAkas.map(aka => (
              <ListItem key={aka.id}>
                <Link to={`/cocktails/${aka.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {titleize(aka.name)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {potentialVariations && potentialVariations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
            Variations
          </Typography>
          <List dense>
            {potentialVariations.map(variation => (
              <ListItem key={variation.id}>
                <Link to={`/cocktails/${variation.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {titleize(variation.name)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}; 