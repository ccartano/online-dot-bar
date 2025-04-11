import { useEffect, useState } from 'react';
import { CocktailTable } from './CocktailTable';
import { Cocktail, CocktailService } from '../services/cocktail.service';
import { PaperlessDocument } from '../types/paperless.types';
import { Alert, Snackbar, FormControlLabel, Switch, Box } from '@mui/material';
import { getApiUrl } from '../config/api.config';

export const PotentialCocktailsPage: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchCocktails();
  }, []);

  const fetchCocktails = async () => {
    try {
      const response = await fetch(getApiUrl('/paperless/documents'));
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const documents: PaperlessDocument[] = await response.json();
      const parsedCocktails = CocktailService.parseCocktailsFromDocuments(documents).map(cocktail => ({
        ...cocktail,
        created: documents.find(doc => doc.id === cocktail.paperlessId)?.created
      }));
      
      // Check status for each cocktail
      const cocktailsWithStatus = await Promise.all(
        parsedCocktails.map(async (cocktail) => {
          try {
            const statusResponse = await fetch(getApiUrl(`/cocktails/paperless/${cocktail.paperlessId}`));
            if (!statusResponse.ok) {
              return {
                ...cocktail,
                status: 'pending' as const
              };
            }
            const data = await statusResponse.json();
            return {
              ...cocktail,
              status: data.status || 'pending'
            };
          } catch (err) {
            return {
              ...cocktail,
              status: 'pending' as const
            };
          }
        })
      );
      
      setCocktails(cocktailsWithStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCocktailUpdate = async (updatedCocktail: Cocktail) => {
    try {
      if (!updatedCocktail.glassType?.id) {
        throw new Error('Please select a glass type');
      }

      // First get all ingredients
      const ingredientsResponse = await fetch(getApiUrl('/ingredients'));
      if (!ingredientsResponse.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const allIngredients = await ingredientsResponse.json();

      // Create or get all ingredients
      const ingredientPromises = updatedCocktail.ingredients.map(async (ingredient) => {
        // Find existing ingredient
        const existingIngredient = allIngredients.find(
          (i: { name: string }) => i.name.toLowerCase() === ingredient.ingredient.name.toLowerCase()
        );
        
        if (existingIngredient) {
          return existingIngredient.id;
        }

        // Create new ingredient if it doesn't exist
        const createResponse = await fetch(getApiUrl('/ingredients'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: ingredient.ingredient.name
          }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create ingredient');
        }

        const newIngredient = await createResponse.json();
        return newIngredient.id;
      });

      const ingredientIds = await Promise.all(ingredientPromises);

      // Now create the cocktail with the ingredient IDs
      const response = await fetch(getApiUrl('/cocktails'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedCocktail.name,
          instructions: updatedCocktail.instructions,
          paperlessId: updatedCocktail.paperlessId,
          glassTypeId: updatedCocktail.glassType.id,
          ingredients: updatedCocktail.ingredients.map((ingredient, index) => ({
            ingredientId: ingredientIds[index],
            amount: ingredient.amount ? parseFloat(ingredient.amount) : undefined,
            unit: ingredient.unit,
            order: index
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create cocktail');
      }

      // Update the status of the cocktail in the list
      setCocktails(cocktails.map(cocktail => 
        cocktail.id === updatedCocktail.id 
          ? { ...cocktail, status: 'active' }
          : cocktail
      ));

      setSnackbar({
        open: true,
        message: 'Cocktail created successfully!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to create cocktail',
        severity: 'error',
      });
    }
  };

  const filteredCocktails = showOnlyPending
    ? cocktails.filter(cocktail => cocktail.status === 'pending')
    : cocktails;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <h1 className="text-3xl font-bold">Potential Cocktail Recipes</h1>
        <FormControlLabel
          control={
            <Switch
              checked={showOnlyPending}
              onChange={(e) => setShowOnlyPending(e.target.checked)}
              color="primary"
            />
          }
          label="Show only pending"
        />
      </Box>
      <CocktailTable cocktails={filteredCocktails} onCocktailUpdate={handleCocktailUpdate} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}; 