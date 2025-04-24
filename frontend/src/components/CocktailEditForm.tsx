import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  ListItemIcon,
  ListItemText,
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Icon } from '@mdi/react';
import { mdiGlassCocktail } from '@mdi/js';
import { Cocktail, CocktailIngredient, MeasurementUnit } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';

interface CocktailEditFormProps {
  initialCocktail: Cocktail;
  glassTypes: GlassType[];
  onSave: (updatedCocktail: Cocktail) => void;
  onCancel: () => void;
  onViewThumbnail: (cocktail: Cocktail) => void;
  isMobile?: boolean;
}

interface NewIngredientState {
  order: number;
  amount?: number;
  unit?: MeasurementUnit;
  notes?: string;
  ingredient: {
    name: string;
    slug: string;
  };
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};


export const CocktailEditForm: React.FC<CocktailEditFormProps> = ({
  initialCocktail,
  glassTypes,
  onSave,
  onCancel,
  onViewThumbnail,
  isMobile = false,
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm')) || isMobile;
  const [editingCocktail, setEditingCocktail] = useState<Cocktail>(initialCocktail);
  const [newIngredient, setNewIngredient] = useState<NewIngredientState>({
    order: 0,
    ingredient: { 
      name: '',
      slug: ''
    },
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingIngredientNames, setEditingIngredientNames] = useState<Record<number, string>>({});

  // Only update the editing state when the initial cocktail ID changes
  useEffect(() => {
    if (initialCocktail.id !== editingCocktail.id) {
      setEditingCocktail(initialCocktail);
      // Reset the editing names when switching cocktails
      setEditingIngredientNames({});
    }
  }, [initialCocktail.id]);

  const handleInputChange = (field: keyof Cocktail, value: Cocktail[keyof Cocktail] | number | null) => {
    setEditingCocktail(prev => ({ ...prev!, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof CocktailIngredient | 'ingredient.name', value: string | number | MeasurementUnit | undefined) => {
    setEditingCocktail(prev => {
      if (!prev) return prev;
      const newIngredients = [...prev.ingredients];
      const currentIngredientItem = newIngredients[index];

      if (field === 'ingredient.name') {
        const newName = value as string;
        newIngredients[index] = {
          ...currentIngredientItem,
          ingredient: {
            ...currentIngredientItem.ingredient,
            name: newName,
            slug: generateSlug(newName)
          }
        };
      } else if (field === 'amount') {
        newIngredients[index] = { 
          ...currentIngredientItem, 
          amount: value ? parseFloat(value as string) : undefined 
        };
      } else if (field === 'unit') {
        newIngredients[index] = { 
          ...currentIngredientItem, 
          unit: value as MeasurementUnit || undefined 
        };
      } else if (field === 'notes') {
        newIngredients[index] = { 
          ...currentIngredientItem, 
          notes: value as string || undefined 
        };
      }
      
      if (JSON.stringify(newIngredients[index]) === JSON.stringify(currentIngredientItem)) {
        return prev;
      }
      
      return { ...prev, ingredients: newIngredients };
    });
  };

  const handleIngredientNameChange = (index: number, value: string) => {
    setEditingIngredientNames(prev => ({
      ...prev,
      [index]: value
    }));

    // Remove auto unit selection
    // const suggestedUnit = suggestUnit(value);
    // handleIngredientChange(index, 'unit', suggestedUnit);
  };

  const handleIngredientNameBlur = (index: number) => {
    const newName = editingIngredientNames[index];
    if (newName !== undefined) {
      handleIngredientChange(index, 'ingredient.name', newName);
      setEditingIngredientNames(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.ingredient.name.trim() && editingCocktail) {
      const ingredientToAdd: CocktailIngredient = {
        amount: newIngredient.amount,
        unit: newIngredient.unit,
        notes: newIngredient.notes,
        order: editingCocktail.ingredients.length + 1,
        ingredient: {
          name: newIngredient.ingredient.name.trim(),
          slug: generateSlug(newIngredient.ingredient.name.trim())
        },
      };
      setEditingCocktail(prev => ({
        ...prev!,
        ingredients: [...prev!.ingredients, ingredientToAdd],
      }));
      setNewIngredient({ 
        order: 0, 
        ingredient: { 
          name: '',
          slug: ''
        } 
      });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setEditingCocktail(prev => ({
      ...prev!,
      ingredients: prev!.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSaveClick = () => {
    setSaveError(null);
    if (editingCocktail.ingredients.length === 0) {
      setSaveError('Cannot save cocktail with no ingredients. Please add at least one.');
      return;
    }

    // Ensure all ingredient names are saved from the editing state
    const finalCocktail = { ...editingCocktail };
    Object.entries(editingIngredientNames).forEach(([index, name]) => {
      const idx = parseInt(index);
      if (finalCocktail.ingredients[idx]) {
        finalCocktail.ingredients[idx] = {
          ...finalCocktail.ingredients[idx],
          ingredient: {
            ...finalCocktail.ingredients[idx].ingredient,
            name
          }
        };
      }
    });

    onSave(finalCocktail);
  };

  return (
    <Box sx={{ margin: isMobileView ? 0.5 : 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobileView ? 2 : 3 }}>
        {/* Cocktail Name */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Cocktail Name
          </Typography>
          <TextField
            value={editingCocktail.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            size={isMobileView ? "small" : "medium"}
            sx={{ maxWidth: isMobileView ? '100%' : '400px' }}
          />
        </Box>

        {/* Reference Image Button */}
        {editingCocktail.paperlessId && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
              Reference Image
            </Typography>
            <Button
              variant="outlined"
              size={isMobileView ? "small" : "medium"}
              onClick={(e) => {
                e.stopPropagation();
                onViewThumbnail(editingCocktail);
              }}
            >
              View Thumbnail
            </Button>
          </Box>
        )}

        {/* Glass Type */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Glass Type
          </Typography>
          <FormControl fullWidth>
            <Select
              value={editingCocktail.glassType?.id || ''}
              onChange={(e) => {
                const selectedGlassType = glassTypes.find(gt => gt.id === e.target.value);
                handleInputChange('glassType', selectedGlassType);
              }}
              displayEmpty
              size={isMobileView ? "small" : "medium"}
              sx={{ maxWidth: isMobileView ? '100%' : '300px' }}
            >
              {glassTypes.map((glassType) => (
                <MenuItem key={glassType.id} value={glassType.id}>
                  <ListItemIcon>
                    <Icon path={glassType.icon || mdiGlassCocktail} size={1} />
                  </ListItemIcon>
                  <ListItemText primary={glassType.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Description */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Description
          </Typography>
          <TextField
            multiline
            rows={isMobileView ? 4 : 3}
            fullWidth
            size={isMobileView ? "small" : "medium"}
            value={editingCocktail.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper'
              }
            }}
          />
        </Box>

        {/* Ingredients Section */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Ingredients
          </Typography>
          {isMobileView ? (
            // Mobile view - Stack layout
            <Stack spacing={1} sx={{ mb: 2 }}>
              {editingCocktail.ingredients.map((ingredient, index) => (
                <Paper key={`${ingredient.ingredient.name}-${index}`} 
                  sx={{ 
                    p: 1.5,
                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.01)' : 'transparent'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ingredient {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveIngredient(index);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  <Stack spacing={1}>
                    <TextField
                      label="Name"
                      size="small"
                      value={editingIngredientNames[index] ?? ingredient.ingredient.name}
                      onChange={(e) => handleIngredientNameChange(index, e.target.value)}
                      onBlur={() => handleIngredientNameBlur(index)}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Amount"
                        size="small"
                        value={ingredient.amount || ''}
                        onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                        type="number"
                        inputProps={{ step: "0.25" }}
                        sx={{ width: '40%' }}
                      />
                      <FormControl size="small" sx={{ width: '60%' }}>
                        <Select
                          value={ingredient.unit || ''}
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value as MeasurementUnit || undefined)}
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Select unit</em>
                          </MenuItem>
                          {Object.values(MeasurementUnit).map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit.toLowerCase()}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            // Desktop view - Table layout
            <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="20%">Amount</TableCell>
                    <TableCell width="20%">Unit</TableCell>
                    <TableCell width="50%">Name</TableCell>
                    <TableCell width="10%" align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editingCocktail.ingredients.map((ingredient, index) => (
                    <TableRow key={`${ingredient.ingredient.name}-${index}`} hover>
                      <TableCell>
                        <TextField
                          size="small"
                          value={ingredient.amount || ''}
                          onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                          type="number"
                          inputProps={{ step: "0.25" }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={ingredient.unit || ''}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value as MeasurementUnit || undefined)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Select unit</em>
                            </MenuItem>
                            {Object.values(MeasurementUnit).map((unit) => (
                              <MenuItem key={unit} value={unit}>
                                {unit.toLowerCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={editingIngredientNames[index] ?? ingredient.ingredient.name}
                          onChange={(e) => handleIngredientNameChange(index, e.target.value)}
                          onBlur={() => handleIngredientNameBlur(index)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveIngredient(index);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Add New Ingredient */}
          {isMobileView ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                size="small"
                value={newIngredient.ingredient?.name || ''}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, ingredient: { ...prev.ingredient, name: e.target.value } }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Amount"
                  size="small"
                  type="number"
                  inputProps={{ step: "0.25" }}
                  value={newIngredient.amount || ''}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, amount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  sx={{ width: '40%' }}
                />
                <FormControl size="small" sx={{ width: '60%' }}>
                  <Select
                    value={newIngredient.unit || ''}
                    onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value as MeasurementUnit }))}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select unit</em>
                    </MenuItem>
                    {Object.values(MeasurementUnit).map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit.toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddIngredient}
                disabled={!newIngredient.ingredient?.name?.trim()}
                fullWidth
                startIcon={<Add />}
              >
                Add Ingredient
              </Button>
            </Stack>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <TextField
                label="Amount"
                size="small"
                type="number"
                inputProps={{ step: "0.25" }}
                value={newIngredient.amount || ''}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, amount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                sx={{ width: '120px' }}
              />
              <FormControl size="small" sx={{ width: '120px' }}>
                <Select
                  value={newIngredient.unit || ''}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value as MeasurementUnit }))}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select unit</em>
                  </MenuItem>
                  {Object.values(MeasurementUnit).map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit.toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Name"
                size="small"
                value={newIngredient.ingredient?.name || ''}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, ingredient: { ...prev.ingredient, name: e.target.value } }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                sx={{ flex: 1 }}
              />
              <IconButton
                color="primary"
                onClick={handleAddIngredient}
                disabled={!newIngredient.ingredient?.name?.trim()}
              >
                <Add />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Instructions */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Instructions
          </Typography>
          <TextField
            multiline
            rows={isMobileView ? 4 : 3}
            fullWidth
            size={isMobileView ? "small" : "medium"}
            value={editingCocktail.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper'
              }
            }}
          />
        </Box>

        {/* Display Save Error Alert */}
        {saveError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={onCancel} variant="outlined" size={isMobileView ? "small" : "medium"}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveClick}
            variant="contained"
            color="primary"
            size={isMobileView ? "small" : "medium"}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; 