import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Cocktail, MeasurementUnit } from '../services/cocktail.service';
import { fetchCocktailBySlug } from '../services/cocktail.service';

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

// Define type for the API response
interface CocktailDetailData {
  cocktail: Cocktail;
  potentialAkas: { id: number; name: string }[];
  potentialVariations: { id: number; name: string }[];
}

export const CocktailDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cocktailData, setCocktailData] = useState<CocktailDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const cocktail = await fetchCocktailBySlug(slug || '');
        setCocktailData({
          cocktail,
          potentialAkas: [], // These will be populated by the backend
          potentialVariations: [], // These will be populated by the backend
        });
      } catch {
        setError('Cocktail not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCocktail();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '600px', margin: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!cocktailData) {
    return (
      <Box sx={{ p: 3, maxWidth: '600px', margin: 'auto' }}>
        <Alert severity="warning">Cocktail not found.</Alert>
      </Box>
    );
  }

  const { cocktail, potentialAkas, potentialVariations } = cocktailData;

  const formatAmountAndUnit = (ingredient: Cocktail['ingredients'][0]) => {
    // If there's no amount or unit is OTHER (case-insensitive), return empty string
    if (!ingredient.amount || (ingredient.unit && ingredient.unit.toLowerCase() === MeasurementUnit.OTHER.toLowerCase())) {
      return '';
    }
    
    const amount = ingredient.amount as number;
    let unit = ingredient.unit || MeasurementUnit.OZ; // Provide default value
    
    // Convert ml to oz if needed (case-insensitive comparison)
    if (unit.toLowerCase() === MeasurementUnit.ML.toLowerCase()) {
      // 1 ml = 0.033814 oz (more precise conversion)
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
        if (diff < minDiff) {
          minDiff = diff;
          closestFraction = fraction;
        }
      }

      // If the decimal part is close enough to a fraction, use it
      if (minDiff < 0.05) {
        return `${wholeNumber ? `${wholeNumber}${closestFraction}` : closestFraction} ${unit.toLowerCase()}`;
      }

      // Otherwise, round to 1 decimal place
      return `${Math.round(convertedAmount * 10) / 10} ${unit.toLowerCase()}`;
    }
    
    // For non-ml units, use the original amount
    const formattedAmount = Number.isInteger(amount) ? amount.toString() : amount.toFixed(1).replace(/\.0$/, '');
    const formattedUnit = unit.toLowerCase();
    
    // Handle pluralization for dash
    if (formattedUnit === 'dash' && amount > 1) {
      return `${formattedAmount} dashes`;
    }
    
    return `${formattedAmount} ${formattedUnit}`;
  };

  const formatIngredientName = (ingredient: Cocktail['ingredients'][0]) => {
    if (!ingredient.amount && ingredient.unit && ingredient.unit.toLowerCase() !== MeasurementUnit.OTHER.toLowerCase()) {
      return `${titleize(ingredient.unit)} of ${titleize(ingredient.ingredient.name)}`;
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
            fontFamily: 'Corinthia, cursive',
            fontSize: { xs: '2.5rem', sm: '3rem' },
            color: '#1a1a1a'
          }}
        >
          {titleize(cocktail.name)}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Corinthia, cursive', fontSize: '2rem' }}>
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
                  fontFamily: 'Corinthia, cursive',
                  fontSize: '2.5rem',
                  lineHeight: 1,
                  minWidth: 'fit-content',
                  minHeight: '2.5rem', // Add minimum height to match font size
                  display: 'flex',
                  alignItems: 'center'
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
                  <Link to={`/ingredients/${ingredient.ingredient.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {formatIngredientName(ingredient)}
                  </Link>
                ) : (
                  formatIngredientName(ingredient)
                )}
              </Box>
            </ListItem>
          ))}
          {cocktail.glassType && (
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
                  fontFamily: 'Corinthia, cursive',
                  fontSize: '1.75rem',
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
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Corinthia, cursive', fontSize: '2rem' }}>
          Instructions
        </Typography>
        <Typography 
          variant="serif"
          sx={{ 
            whiteSpace: 'pre-line'
          }}
        >
          {sentenceCapitalize(cocktail.instructions)}
        </Typography>
      </Box>

      {potentialAkas && potentialAkas.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Corinthia, cursive', fontSize: '2rem' }}>
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
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Corinthia, cursive', fontSize: '2rem' }}>
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