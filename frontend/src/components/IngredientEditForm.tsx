import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Ingredient, IngredientType } from '../types/ingredient.types';

interface IngredientEditFormProps {
  ingredient: Ingredient;
  onSave: (updatedIngredient: Partial<Ingredient>) => Promise<void>; // Made async
  onCancel: () => void;
  isSaving?: boolean; // Optional prop to show saving state
}

export const IngredientEditForm: React.FC<IngredientEditFormProps> = ({
  ingredient,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [name, setName] = useState(ingredient.name);
  const [description, setDescription] = useState(ingredient.description || '');
  const [type, setType] = useState<IngredientType>(ingredient.type);
  const [imageUrl, setImageUrl] = useState(ingredient.imageUrl || '');

  // Update state if the initial ingredient prop changes (e.g., switching edit row)
  useEffect(() => {
    setName(ingredient.name);
    setDescription(ingredient.description || '');
    setType(ingredient.type);
    setImageUrl(ingredient.imageUrl || '');
  }, [ingredient]);

  const handleSave = async () => {
    const updatedData: Partial<Ingredient> = {
      name,
      description: description.trim() === '' ? null : description.trim(),
      type,
      imageUrl: imageUrl.trim() === '' ? null : imageUrl.trim(),
    };
    await onSave(updatedData);
  };

  return (
    <Box component="form" sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small" disabled={isSaving}>
            <InputLabel id="ingredient-type-label">Type</InputLabel>
            <Select
              labelId="ingredient-type-label"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as IngredientType)}
            >
              {Object.values(IngredientType).map((enumValue) => (
                <MenuItem key={enumValue} value={enumValue}>
                  {enumValue.charAt(0).toUpperCase() + enumValue.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            maxRows={2} // Limit height a bit
            size="small"
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
           <TextField
            label="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            size="small"
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <Button onClick={onCancel} variant="outlined" size="small" disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            size="small" 
            disabled={isSaving || !name} // Disable if saving or name is empty
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}; 