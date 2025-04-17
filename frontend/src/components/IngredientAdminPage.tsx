import { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Ingredient } from '../types/ingredient.types';
import { fetchIngredients } from '../services/ingredient.service';
import { IngredientAdminTable } from './IngredientAdminTable';

export const IngredientAdminPage: React.FC = () => {
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

  const handleIngredientUpdate = (updatedIngredient: Ingredient) => {
    setIngredients(prev => 
      prev.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing)
    );
    setSnackbar({ open: true, message: `Ingredient '${updatedIngredient.name}' updated successfully!`, severity: 'success' });
  };

  // Add handleIngredientDelete later if needed

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <IngredientAdminTable 
        ingredients={ingredients} 
        onIngredientUpdate={handleIngredientUpdate}
        // Pass onDelete later
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
  );
}; 