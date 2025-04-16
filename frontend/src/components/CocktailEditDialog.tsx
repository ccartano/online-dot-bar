import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { Cocktail } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';
import { CocktailEditForm } from './CocktailEditForm';
import { getApiUrl } from '../config/api.config';
import { AdminService } from '../services/admin.service';

interface CocktailEditDialogProps {
  open: boolean;
  onClose: () => void;
  cocktail: Cocktail;
  glassTypes: GlassType[];
  onCocktailUpdated: (updatedCocktail: Cocktail) => void;
}

export const CocktailEditDialog: React.FC<CocktailEditDialogProps> = ({
  open,
  onClose,
  cocktail,
  glassTypes,
  onCocktailUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (updatedCocktail: Cocktail) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const adminToken = AdminService.getAdminToken();
      if (!adminToken) {
        throw new Error('Admin access required');
      }

      const response = await fetch(getApiUrl(`/cocktails/${cocktail.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(updatedCocktail),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to update cocktail');
      }

      const data = await response.json();
      onCocktailUpdated(data);
      onClose();
    } catch (error) {
      console.error('Error updating cocktail:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle>Edit Cocktail</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <CocktailEditForm
            initialCocktail={cocktail}
            glassTypes={glassTypes}
            onSave={handleSave}
            onCancel={onClose}
            onViewThumbnail={() => {}} // TODO: Implement thumbnail view if needed
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 