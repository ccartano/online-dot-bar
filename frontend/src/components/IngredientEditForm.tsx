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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Ingredient, IngredientType } from '../types/ingredient.types';

interface IngredientEditFormProps {
  ingredient: Ingredient;
  onSave: (updatedIngredient: Partial<Ingredient>) => Promise<void>; // Made async
  onCancel: () => void;
  isSaving?: boolean; // Optional prop to show saving state
  isMobile?: boolean;
}

export const IngredientEditForm: React.FC<IngredientEditFormProps> = ({
  ingredient,
  onSave,
  onCancel,
  isSaving = false,
  isMobile = false,
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm')) || isMobile;
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

  // Map of enum values to human-readable labels
  const typeOptions = {
    [IngredientType.SPIRIT]: 'Spirit',
    [IngredientType.LIQUEUR]: 'Liqueur',
    [IngredientType.FORTIFIED_WINE]: 'Fortified Wine',
    [IngredientType.APERITIF_DIGESTIF]: 'Aperitif/Digestif',
    [IngredientType.AROMATIC_BITTER]: 'Aromatic Bitter',
    [IngredientType.CITRUS_BITTER]: 'Citrus Bitter',
    [IngredientType.HERBAL_BITTER]: 'Herbal Bitter',
    [IngredientType.CARBONATED_MIXER]: 'Carbonated Mixer',
    [IngredientType.JUICE]: 'Juice',
    [IngredientType.DAIRY]: 'Dairy',
    [IngredientType.HOT_BEVERAGE]: 'Hot Beverage',
    [IngredientType.SIMPLE_SYRUP]: 'Simple Syrup',
    [IngredientType.FLAVORED_SYRUP]: 'Flavored Syrup',
    [IngredientType.SPECIALTY_SYRUP]: 'Specialty Syrup',
    [IngredientType.FRUIT_GARNISH]: 'Fruit Garnish',
    [IngredientType.HERB_GARNISH]: 'Herb Garnish',
    [IngredientType.SPICE_GARNISH]: 'Spice Garnish',
    [IngredientType.OTHER_GARNISH]: 'Other Garnish',
    [IngredientType.WINE]: 'Wine',
    [IngredientType.ENHANCERS]: 'Enhancers',
    [IngredientType.OTHER]: 'Other',
  };

  return (
    <Box component="form" sx={{ p: isMobileView ? 1 : 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: isMobileView ? 1 : 2,
        '& > *': {
          flex: isMobileView ? '1 1 100%' : '1 1 200px',
          minWidth: isMobileView ? '100%' : '200px',
        }
      }}>
        <Box>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size={isMobileView ? "small" : "medium"}
            disabled={isSaving}
          />
        </Box>
        <Box>
          <FormControl fullWidth size={isMobileView ? "small" : "medium"} disabled={isSaving}>
            <InputLabel id="ingredient-type-label">Type</InputLabel>
            <Select
              labelId="ingredient-type-label"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as IngredientType)}
            >
              {Object.entries(typeOptions).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: isMobileView ? '1 1 100%' : '2 1 300px' }}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            maxRows={isMobileView ? 1 : 2}
            size={isMobileView ? "small" : "medium"}
            disabled={isSaving}
          />
        </Box>
        <Box>
          <TextField
            label="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            size={isMobileView ? "small" : "medium"}
            disabled={isSaving}
          />
        </Box>
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1, 
          mt: 1 
        }}>
          <Button 
            onClick={onCancel} 
            variant="outlined" 
            size={isMobileView ? "small" : "medium"} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            size={isMobileView ? "small" : "medium"} 
            disabled={isSaving || !name}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; 