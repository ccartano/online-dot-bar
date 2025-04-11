import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TableSortLabel,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Add, Delete, AddCircle } from '@mui/icons-material';
import { Icon } from '@mdi/react';
import { glassTypeIcons, GlassTypeIcon } from '../constants/glassTypes';
import { Cocktail, CocktailIngredient } from '../services/cocktail.service';
import { getApiUrl } from '../config/api.config';
import { GlassType } from '../types/glass.types';

interface CocktailTableProps {
  cocktails: (Cocktail & { status: 'active' | 'pending' })[];
  onCocktailUpdate: (cocktail: Cocktail) => void;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Cocktail;
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Cocktail Name', sortable: true },
  { id: 'ingredients', label: 'Ingredients', sortable: false },
  { id: 'instructions', label: 'Instructions', sortable: false },
  { id: 'created', label: 'Added', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const CocktailTable: React.FC<CocktailTableProps> = ({ cocktails, onCocktailUpdate }) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Cocktail>('created');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingCocktail, setEditingCocktail] = useState<Cocktail | null>(null);
  const [newIngredient, setNewIngredient] = useState<CocktailIngredient>({ name: '' });
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);
  const [newGlassType, setNewGlassType] = useState<Partial<GlassTypeIcon>>({});
  const [isNewGlassTypeDialogOpen, setIsNewGlassTypeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlassTypes = async () => {
      try {
        const response = await fetch(getApiUrl('/glass-types'));
        if (!response.ok) {
          throw new Error('Failed to fetch glass types');
        }
        const data = await response.json();
        setGlassTypes(data);
      } catch (err) {
        console.error('Error fetching glass types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlassTypes();
  }, []);

  const handleRequestSort = (property: keyof Cocktail) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleEditClick = (cocktail: Cocktail) => {
    setEditingCocktail({ ...cocktail });
  };

  const handleCloseDialog = () => {
    setEditingCocktail(null);
    setNewIngredient({ name: '' });
  };

  const handleSave = () => {
    if (editingCocktail && onCocktailUpdate) {
      onCocktailUpdate(editingCocktail);
    }
    handleCloseDialog();
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && editingCocktail) {
      setEditingCocktail({
        ...editingCocktail,
        ingredients: [...editingCocktail.ingredients, { ...newIngredient, name: newIngredient.name.trim() }],
      });
      setNewIngredient({ name: '' });
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: CocktailIngredient) => {
    if (editingCocktail) {
      setEditingCocktail({
        ...editingCocktail,
        ingredients: editingCocktail.ingredients.filter(
          (ingredient) => ingredient.name !== ingredientToRemove.name
        ),
      });
    }
  };

  const sortedCocktails = React.useMemo(() => {
    return [...cocktails].sort((a, b) => {
      if (orderBy === 'name') {
        return order === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (orderBy === 'status') {
        return order === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
  }, [cocktails, order, orderBy]);

  const handleCreateGlassType = async () => {
    try {
      const response = await fetch(getApiUrl('/glass-types'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGlassType,
          icon: glassTypeIcons.find(gt => gt.name === newGlassType.name)?.icon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create glass type');
      }

      const createdGlassType = await response.json();
      setGlassTypes([...glassTypes, createdGlassType]);
      setEditingCocktail({
        ...editingCocktail!,
        glassType: createdGlassType,
      });
      setIsNewGlassTypeDialogOpen(false);
      setNewGlassType({});
    } catch (error) {
      console.error('Error creating glass type:', error);
    }
  };

  const handleGlassTypeChange = (cocktail: Cocktail, glassTypeId: number) => {
    const updatedCocktail = {
      ...cocktail,
      glassType: {
        id: glassTypeId,
        name: glassTypes.find(gt => gt.id === glassTypeId)?.name || ''
      }
    };
    onCocktailUpdate(updatedCocktail);
  };

  if (loading) {
    return <div>Loading glass types...</div>;
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%',
          overflow: 'auto'
        }}
      >
        <Table 
          stickyHeader 
          aria-label="cocktail table"
          sx={{
            tableLayout: 'fixed',
            minWidth: '100%'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width="5%" />
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  width={headCell.id === 'name' ? '20%' : 
                         headCell.id === 'ingredients' ? '25%' : 
                         headCell.id === 'instructions' ? '30%' : 
                         headCell.id === 'created' ? '10%' : 
                         headCell.id === 'status' ? '10%' : 'auto'}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
              <TableCell width="5%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCocktails.map((cocktail) => (
              <React.Fragment key={cocktail.id}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(cocktail.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                    >
                      {expandedRow === cocktail.id ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {cocktail.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {cocktail.ingredients[0]?.name} and {cocktail.ingredients.length - 1} more
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cocktail.instructions}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {cocktail.created ? new Date(cocktail.created).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cocktail.status.toUpperCase()}
                      color={cocktail.status === 'active' ? 'success' : 'warning'}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        minWidth: '80px',
                        justifyContent: 'center'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(cocktail);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedRow === cocktail.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Full Recipe
                        </Typography>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Ingredients
                          </Typography>
                          <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Amount</TableCell>
                                  <TableCell>Unit</TableCell>
                                  <TableCell>Name</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {cocktail.ingredients.map((ingredient, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {ingredient.amount || ''}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {ingredient.unit || ''}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {ingredient.name}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <Typography variant="subtitle1" gutterBottom>
                            Instructions:
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {cocktail.instructions}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editingCocktail} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Cocktail</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Cocktail Name"
              value={editingCocktail?.name || ''}
              onChange={(e) => setEditingCocktail({ ...editingCocktail!, name: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Glass Type</InputLabel>
              <Select
                value={editingCocktail?.glassType?.id || ''}
                onChange={(e) => {
                  const selectedGlassType = glassTypes.find(gt => gt.id === e.target.value);
                  setEditingCocktail({
                    ...editingCocktail!,
                    glassType: selectedGlassType,
                  });
                }}
                label="Glass Type"
              >
                {glassTypes.map((glassType) => (
                  <MenuItem key={glassType.id} value={glassType.id}>
                    <ListItemIcon>
                      <Icon path={glassType.icon} size={1} />
                    </ListItemIcon>
                    <ListItemText primary={glassType.name} secondary={glassType.description} />
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem
                  value="new"
                  onClick={() => setIsNewGlassTypeDialogOpen(true)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AddCircle color="primary" />
                  <Typography>Create New Glass Type</Typography>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ingredients
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Amount</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editingCocktail?.ingredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={ingredient.amount || ''}
                            onChange={(e) => {
                              const newIngredients = [...editingCocktail.ingredients];
                              newIngredients[index] = {
                                ...ingredient,
                                amount: e.target.value || undefined
                              };
                              setEditingCocktail({ ...editingCocktail, ingredients: newIngredients });
                            }}
                            type="text"
                            inputProps={{ step: "0.25" }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={ingredient.unit || ''}
                            onChange={(e) => {
                              const newIngredients = [...editingCocktail.ingredients];
                              newIngredients[index] = {
                                ...ingredient,
                                unit: e.target.value || undefined
                              };
                              setEditingCocktail({ ...editingCocktail, ingredients: newIngredients });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={ingredient.name}
                            onChange={(e) => {
                              const newIngredients = [...editingCocktail.ingredients];
                              newIngredients[index] = {
                                ...ingredient,
                                name: e.target.value
                              };
                              setEditingCocktail({ ...editingCocktail, ingredients: newIngredients });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveIngredient(ingredient)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Amount"
                  value={newIngredient.amount || ''}
                  onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value || undefined })}
                  type="number"
                  size="small"
                  inputProps={{ step: "0.25" }}
                />
                <TextField
                  label="Unit"
                  value={newIngredient.unit || ''}
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Name"
                  value={newIngredient.name || ''}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddIngredient} color="primary">
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            <TextField
              label="Instructions"
              value={editingCocktail?.instructions || ''}
              onChange={(e) => setEditingCocktail({ ...editingCocktail!, instructions: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isNewGlassTypeDialogOpen} onClose={() => setIsNewGlassTypeDialogOpen(false)}>
        <DialogTitle>Create New Glass Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Glass Type</InputLabel>
              <Select
                value={newGlassType.name || ''}
                onChange={(e) => {
                  const selectedGlassType = glassTypeIcons.find(gt => gt.name === e.target.value);
                  setNewGlassType({
                    name: selectedGlassType?.name || '',
                    description: selectedGlassType?.description,
                    icon: selectedGlassType?.icon,
                  });
                }}
                label="Glass Type"
              >
                {glassTypeIcons.map((glassType) => (
                  <MenuItem key={glassType.id} value={glassType.name}>
                    <ListItemIcon>
                      <Icon path={glassType.icon} size={1} />
                    </ListItemIcon>
                    <ListItemText primary={glassType.name} secondary={glassType.description} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={newGlassType.description || ''}
              onChange={(e) => setNewGlassType({ ...newGlassType, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewGlassTypeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateGlassType} 
            variant="contained" 
            color="primary"
            disabled={!newGlassType.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 