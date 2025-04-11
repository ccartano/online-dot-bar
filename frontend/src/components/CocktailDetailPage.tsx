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
    const parts = [];
    if (ingredient.amount) parts.push(ingredient.amount);
    if (ingredient.unit) parts.push(ingredient.unit);
    return parts.join(' ');
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
          {cocktail.ingredients.map((ingredient, index) => (
            <ListItem key={index} sx={{ py: 0, display: 'flex', width: '100%', alignItems: 'center' }}>
              <div style={{ 
                fontFamily: 'Italianno, cursive',
                fontSize: '2rem',
                lineHeight: 1,
                width: ingredient.amount ? 'fit-content' : '245px'
              }}>
                {formatAmountAndUnit(ingredient)}
              </div>
              {ingredient.amount && (
                <div style={{ 
                  lineHeight: 1,
                  color: '#ccc',
                  textAlign: 'left',
                  width: 'fit-content'
                }}>
                  ................................................
                </div>
              )}
              <div style={{ lineHeight: 1, minWidth: '200px', marginLeft: ingredient.amount ? '4px' : 0 }}>
                {formatIngredientName(ingredient)}
              </div>
            </ListItem>
          ))}
        </List>
        {cocktail.glassType?.name && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'Italianno, cursive',
              fontSize: '2rem',
              display: 'inline'
            }}>
              Glass Type:&nbsp;
            </Typography>
            <Typography variant="body1" sx={{ 
              fontSize: '1rem',
              display: 'inline'
            }}>
              {titleize(cocktail.glassType.name)}
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem' }}>
          Instructions
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {sentenceCapitalize(cocktail.instructions)}
        </Typography>
      </Box>
    </Box>
  );
}; 