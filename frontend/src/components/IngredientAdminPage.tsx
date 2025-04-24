import { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Alert, Snackbar, useMediaQuery, useTheme } from '@mui/material';
import { Ingredient } from '../types/ingredient.types';
import { fetchIngredients } from '../services/ingredient.service';
import { IngredientAdminTable } from './IngredientAdminTable';
import { SEO } from './SEO';

interface IngredientAdminPageProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IngredientAdminPage: React.FC<IngredientAdminPageProps> = ({ searchTerm, onSearchChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchIngredients();
      setIngredients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred fetching ingredients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const handleIngredientUpdate = async (updatedIngredient: Ingredient) => {
    try {
      // Update the specific ingredient in the state
      setIngredients(prevIngredients => 
        prevIngredients.map(ingredient => 
          ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
        )
      );
      setSnackbar({ 
        open: true, 
        message: `Ingredient '${updatedIngredient.name}' updated successfully!`, 
        severity: 'success' 
      });
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err instanceof Error ? err.message : 'Failed to update ingredient', 
        severity: 'error' 
      });
    }
  };

  const handleIngredientDelete = async (deletedIngredient: Ingredient) => {
    try {
      // Refresh the ingredients list
      const data = await fetchIngredients();
      setIngredients(data);
      setSnackbar({ 
        open: true, 
        message: `Ingredient '${deletedIngredient.name}' deleted successfully!`, 
        severity: 'success' 
      });
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err instanceof Error ? err.message : 'Failed to delete ingredient', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: isMobile ? 1 : 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: isMobile ? 1 : 3 }}>{error}</Alert>;
  }

  return (
    <>
      <SEO 
        title="Ingredient Management - The Online.Bar"
        description="Administrative interface for managing ingredients"
        noindex={true}
      />
      <Box sx={{ 
        p: isMobile ? 1 : 3,
        width: '100%',
        overflowX: 'auto'
      }}>
        <IngredientAdminTable 
          ingredients={ingredients} 
          onIngredientUpdate={handleIngredientUpdate}
          onIngredientDelete={handleIngredientDelete}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        {snackbar && (
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </>
  );
}; 