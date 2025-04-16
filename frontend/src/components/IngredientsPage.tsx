import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Ingredient, IngredientType } from '../types/ingredient.types';
import { fetchIngredients } from '../services/ingredient.service';
import { IngredientFilters } from './IngredientFilters';

// Helper function to capitalize words (similar to CocktailCard)
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<IngredientType[]>([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        const data = await fetchIngredients();
        setIngredients(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, []);

  const handleTypeChange = (type: IngredientType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const filteredIngredients = useMemo(() => {
    if (selectedTypes.length === 0) {
      return ingredients;
    }
    return ingredients.filter(ingredient => selectedTypes.includes(ingredient.type));
  }, [ingredients, selectedTypes]);

  const ingredientsByLetter = useMemo(() => {
    return filteredIngredients.reduce((acc, ingredient) => {
      const firstLetter = ingredient.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);
  }, [filteredIngredients]);

  const sortedLetters = useMemo(() => Object.keys(ingredientsByLetter).sort(), [ingredientsByLetter]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)',
    overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <IngredientFilters
          selectedTypes={selectedTypes}
          onTypeChange={handleTypeChange}
        />

        <Box sx={{ 
          flex: 1,
          height: '100%',
          p: 3,
          overflowY: 'auto',
          position: 'relative'
        }}>
          {sortedLetters.length > 0 ? (
            sortedLetters.map((letter) => {
              const letterIngredients = ingredientsByLetter[letter] || [];
              if (letterIngredients.length === 0) return null;

              return (
                <Box key={letter} sx={{ mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{
                      fontFamily: 'Italianno, cursive',
                      fontSize: '2.5rem',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {letter}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    '& > *': {
                      flex: '1 1 200px',
                      minWidth: '200px',
                      maxWidth: '300px',
                    }
                  }}>
                    {letterIngredients.map((ingredient) => (
                      <Box key={ingredient.id}>
                        <Link to={`/ingredients/${ingredient.id}`} style={{ textDecoration: 'none' }}>
                          <Typography
                            component="h3"
                            sx={{
                              fontFamily: 'Italianno, cursive',
                              fontSize: '1.8rem',
                              color: 'text.primary',
                              margin: 0,
                              padding: 0,
                              textAlign: 'center',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            {capitalizeWords(ingredient.name)}
                          </Typography>
                        </Link>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography>No ingredients match the current filters.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 