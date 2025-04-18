import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  styled
} from '@mui/material';
import { Ingredient } from '../types/ingredient.types';
import { Cocktail } from '../services/cocktail.service'; // Import Cocktail type
import { fetchIngredientById } from '../services/ingredient.service';
import { fetchCocktailsByIngredient } from '../services/cocktail.service';

const StyledLink = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  transition: 'color 0.2s ease',
  color: '#1A1A1A',
  '&:hover': {
    color: '#9CB4A3',
    '&::after': {
      transform: 'scaleX(1)'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#9CB4A3',
    transform: 'scaleX(0)',
    transition: 'transform 0.2s ease',
    transformOrigin: 'center'
  }
});

// Helper function to capitalize enum values for display
const formatTypeName = (type: string): string => {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const IngredientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Ingredient ID is missing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const ingredientIdNum = parseInt(id, 10);
        if (isNaN(ingredientIdNum)) {
          throw new Error('Invalid Ingredient ID');
        }

        // Fetch ingredient details and cocktails concurrently
        const [ingredientData, cocktailData] = await Promise.all([
          fetchIngredientById(ingredientIdNum),
          fetchCocktailsByIngredient(ingredientIdNum, 10, true), // Fetch 10 random cocktails
        ]);

        setIngredient(ingredientData);
        setCocktails(cocktailData);
        setError(null);
      } catch (err) {
        console.error('Error loading ingredient detail page:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  if (!ingredient) {
    return (
      <Box sx={{ p: 3, maxWidth: '600px', margin: 'auto' }}>
        <Alert severity="warning">Ingredient not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: '600px', 
      margin: 'auto',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem' },
            mb: 1
          }}
        >
          {capitalizeWords(ingredient.name)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2, width: 'fit-content' }}>
        <Typography
          variant="decorative"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.8rem' },
            lineHeight: 1,
            width: 'fit-content',
            mr: 1,
          }}
        >
          Categorization:
        </Typography>
        <Box
          sx={{
            color: '#ccc',
            textAlign: 'left',
            flex: '1 1 auto',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            mr: 1,
          }}
        >
          .....................................
        </Box>
        <Typography
          variant="serifMedium"
          sx={{
            lineHeight: 1,
            minWidth: '100px',
          }}
        >
          {formatTypeName(ingredient.type)}
        </Typography>
      </Box>

      <Box sx={{ pt:3 }}>
      {ingredient.description && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                mb: 1
              }}
            >
              Description:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {ingredient.description}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ pt: 3 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            mb: 2
          }}
        >
          Try cocktails featuring {capitalizeWords(ingredient.name)}
        </Typography>
        <Divider sx={{ mb: 2 }}/>
        {cocktails.length > 0 ? (
          <List>
            {cocktails.map((cocktail) => (
              <ListItem
                key={cocktail.id}
                component={Link}
                to={`/cocktails/${cocktail.id}`}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  display: 'block',
                  p: 1,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'none'
                  }
                }}
              >
                <StyledLink>
                  <ListItemText
                    primary={capitalizeWords(cocktail.name)}
                    primaryTypographyProps={{ 
                      variant: 'serifMedium'
                    }}
                  />
                </StyledLink>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No cocktails found featuring this ingredient in the current selection.</Typography>
        )}
      </Box>
    </Box>
  );
}; 