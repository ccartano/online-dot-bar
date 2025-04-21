import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tabs, Tab, CircularProgress } from '@mui/material';
import { AdminLogin } from './AdminLogin';
import { AdminService } from '../services/admin.service';
import { CocktailTable } from './CocktailTable';
import { Cocktail } from '../services/cocktail.service';
import { getApiUrl } from '../config/api.config';
import { GlassType } from '../types/glass.types';
import { PotentialCocktailsPage } from './PotentialCocktailsPage';
import { IngredientAdminPage } from './IngredientAdminPage';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(AdminService.isAdmin());
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cocktailSearchTerm, setCocktailSearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cocktailToDelete, setCocktailToDelete] = useState<number | null>(null);
  const [view, setView] = useState<'current' | 'potential' | 'ingredients'>('current');
  const updateInProgress = useRef(false);

  const fetchCocktailsAndGlassTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = AdminService.getAdminToken();
      if (!adminToken) {
        throw new Error('Admin token not found. Please log in.');
      }
      
      const [cocktailResponse, glassTypeResponse] = await Promise.all([
        fetch(getApiUrl('/cocktails'), { headers: { 'x-admin-token': adminToken } }),
        fetch(getApiUrl('/glass-types'), { headers: { 'x-admin-token': adminToken } })
      ]);

      if (!cocktailResponse.ok) throw new Error(`Failed to fetch cocktails (Status: ${cocktailResponse.status})`);
      if (!glassTypeResponse.ok) throw new Error(`Failed to fetch glass types (Status: ${glassTypeResponse.status})`);

      const cocktailData = await cocktailResponse.json();
      const glassTypeData = await glassTypeResponse.json();

      setCocktails(cocktailData.map((cocktail: Cocktail) => ({ ...cocktail, status: 'active' as const })));
      setGlassTypes(glassTypeData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCocktailsAndGlassTypes();
    }
  }, [isLoggedIn, fetchCocktailsAndGlassTypes]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleCocktailUpdate = async (updatedCocktail: Cocktail) => {
    if (updateInProgress.current) {
      return;
    }
    updateInProgress.current = true;

    try {
      const adminToken = AdminService.getAdminToken();
      if (!adminToken) {
        throw new Error('Admin access required (token not found in localStorage)');
      }

      const updateData = {
        ...updatedCocktail,
        glassTypeId: updatedCocktail.glassType?.id || null,
        ingredients: updatedCocktail.ingredients.map((ing) => {
          const ingredientId = ing.ingredient.id || undefined;
          return {
            ingredientId: ingredientId,
            amount: ing.amount ? Number(ing.amount) : undefined,
            unit: ing.unit,
            order: ing.order,
          };
        }),
      };

      console.log(`[AdminPage] Sending update data for cocktail ${updatedCocktail.id}:`, JSON.stringify(updateData, null, 2));

      const response = await fetch(getApiUrl(`/cocktails/${updatedCocktail.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMsg = `Failed to update cocktail (Status: ${response.status})`;
        try {
          const errorData = await response.json(); 
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          console.warn("[AdminPage] Could not parse JSON error response body:", parseError);
        }
        console.error(`[AdminPage] Update failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Update the cocktails state with the new data
      setCocktails(prevCocktails => {
        return prevCocktails.map(c => {
          if (c.id === data.id) {
            return {
              ...data,
              status: 'active',
              glassType: glassTypes.find(gt => gt.id === data.glassTypeId) || undefined,
              ingredients: data.ingredients || []
            };
          }
          return c;
        });
      });

      setSnackbar({
        open: true,
        message: 'Cocktail updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('[AdminPage] Error updating cocktail:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update cocktail',
        severity: 'error',
      });
    } finally {
      updateInProgress.current = false;
    }
  };

  const handleDeleteRequest = (cocktailId: number) => {
    setCocktailToDelete(cocktailId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCocktailToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!cocktailToDelete) return;

    try {
      const adminToken = AdminService.getAdminToken();
      if (!adminToken) {
        throw new Error('Admin access required (token not found)');
      }

      const response = await fetch(getApiUrl(`/cocktails/${cocktailToDelete}`), {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin access required (401 from backend)');
        } else if (response.status === 404) {
          throw new Error('Cocktail not found for deletion.');
        }
        throw new Error('Failed to delete cocktail');
      }

      // Deletion successful, update state
      setCocktails(prev => prev.filter(c => c.id !== cocktailToDelete));
      setSnackbar({ 
        open: true, 
        message: 'Cocktail deleted successfully', 
        severity: 'success' 
      });
      handleCloseDialog(); // Close dialog after success

    } catch (err) {
      console.error('[AdminPage] Error during cocktail deletion:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete cocktail',
        severity: 'error',
      });
      handleCloseDialog(); // Close dialog even on error
    }
  };

  const handleViewChange = (_event: React.SyntheticEvent, newValue: 'current' | 'potential' | 'ingredients') => {
    setView(newValue);
  };

  const handleCocktailSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCocktailSearchTerm(event.target.value);
  };

  const handleIngredientSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIngredientSearchTerm(event.target.value);
  };

  if (!isLoggedIn) {
    console.log("[AdminPage] Rendering Login");
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading && view === 'current') {
    console.log("[AdminPage] Rendering Loading...");
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("[AdminPage] Rendering Error:", error);
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  // Log state right before rendering the main content
  console.log("[AdminPage] Rendering main content with state:", {
    loading,
    error,
    view,
    cocktailsCount: cocktails.length,
    glassTypesCount: glassTypes.length,
  });

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button component={Link} to="/" color="inherit">
            Back to Home
          </Button>
        </Toolbar>
      </AppBar>

      <Tabs
        value={view}
        onChange={handleViewChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Current Cocktails" value="current" />
        <Tab label="Potential Cocktails" value="potential" />
        <Tab label="Ingredients" value="ingredients" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 2 }}>
          {view === 'current' && (
            <CocktailTable
              cocktails={cocktails}
              glassTypes={glassTypes}
              onCocktailUpdate={handleCocktailUpdate}
              onDeleteRequest={handleDeleteRequest}
              searchTerm={cocktailSearchTerm}
              onSearchChange={handleCocktailSearchChange}
            />
          )}
          {view === 'potential' && <PotentialCocktailsPage />}
          {view === 'ingredients' && (
            <IngredientAdminPage 
              searchTerm={ingredientSearchTerm}
              onSearchChange={handleIngredientSearchChange}
            />
          )}
        </Box>
      )}

      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this cocktail? This action cannot be undone."
      />

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
    </Box>
  );
}; 