import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminService } from '../services/admin.service';
import { getApiUrl } from '../config/api.config';
import { MeasurementUnit } from '../utils/constants';

interface CocktailIngredient {
  id: number;
  amount: number | null;
  unit: string | null;
  ingredient: {
    id: number;
    name: string;
  };
  cocktail: {
    id: number;
    name: string;
  };
}

export const MeasurementsAdminPage: React.FC = () => {
  const [cocktailIngredients, setCocktailIngredients] = useState<CocktailIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{ amount: number | null; unit: string | null }>({
    amount: null,
    unit: null,
  });

  useEffect(() => {
    fetchCocktailIngredients();
  }, []);

  const fetchCocktailIngredients = async () => {
    try {
      const headers = await AdminService.getAdminHeaders();
      const response = await fetch(getApiUrl('/cocktail-ingredients'), {
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cocktail ingredients');
      }

      const data = await response.json();
      setCocktailIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cocktail ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ingredient: CocktailIngredient) => {
    setEditingId(ingredient.id);
    setEditingValues({
      amount: ingredient.amount,
      unit: ingredient.unit,
    });
  };

  const handleSave = async (id: number) => {
    try {
      const headers = await AdminService.getAdminHeaders();
      const response = await fetch(getApiUrl(`/cocktail-ingredients/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(editingValues),
      });

      if (!response.ok) {
        throw new Error('Failed to update cocktail ingredient');
      }

      setCocktailIngredients((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                amount: editingValues.amount,
                unit: editingValues.unit,
              }
            : item
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cocktail ingredient');
    }
  };

  const filteredIngredients = cocktailIngredients.filter((ingredient) =>
    ingredient.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Search by ingredient name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cocktail</TableCell>
              <TableCell>Ingredient</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIngredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.cocktail.name}</TableCell>
                <TableCell>{ingredient.ingredient.name}</TableCell>
                <TableCell>
                  {editingId === ingredient.id ? (
                    <TextField
                      type="number"
                      value={editingValues.amount || ''}
                      onChange={(e) =>
                        setEditingValues({
                          ...editingValues,
                          amount: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      size="small"
                    />
                  ) : (
                    ingredient.amount
                  )}
                </TableCell>
                <TableCell>
                  {editingId === ingredient.id ? (
                    <FormControl size="small" fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={editingValues.unit || ''}
                        onChange={(e) =>
                          setEditingValues({
                            ...editingValues,
                            unit: e.target.value as MeasurementUnit,
                          })
                        }
                        label="Unit"
                      >
                        {Object.values(MeasurementUnit).map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    ingredient.unit
                  )}
                </TableCell>
                <TableCell>
                  {editingId === ingredient.id ? (
                    <IconButton onClick={() => handleSave(ingredient.id)} color="primary">
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleEdit(ingredient)} color="primary">
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 