import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Box,
  Collapse,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit } from '@mui/icons-material'; // Remove unused Delete icon
import { Ingredient, IngredientType } from '../types/ingredient.types';
import { IngredientEditForm } from './IngredientEditForm'; // Import the edit form
import { updateIngredient } from '../services/ingredient.service'; // Import update service

// --- Sorting Types & Header --- (Similar to IngredientTable, but simplified for admin)
type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Ingredient | string;
  label: string;
  sortable: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Name', sortable: true, width: '25%' },
  { id: 'type', label: 'Type', sortable: true, width: '15%' },
  { id: 'description', label: 'Description', sortable: false, width: '40%' },
  { id: 'actions', label: 'Actions', sortable: false, width: '20%' }, 
];

interface IngredientAdminTableHeaderProps {
  order: Order;
  orderBy: keyof Ingredient | string;
  onRequestSort: (property: keyof Ingredient) => void;
}

const IngredientAdminTableHeader: React.FC<IngredientAdminTableHeaderProps> = (props) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Ingredient) => () => {
    onRequestSort(property);
  };
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, fontWeight: 'bold' }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id as keyof Ingredient)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// --- Main Table Component --- 

interface IngredientAdminTableProps {
  ingredients: Ingredient[];
  onIngredientUpdate: (updatedIngredient: Ingredient) => void;
  // Add onDelete prop later if needed
}

export const IngredientAdminTable: React.FC<IngredientAdminTableProps> = ({ 
  ingredients, 
  onIngredientUpdate 
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Ingredient | string>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const handleRequestSort = (property: keyof Ingredient) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setEditingIngredientId(null); // Close edit form when changing page
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setEditingIngredientId(null); // Close edit form
  };

  const handleEditClick = (id: number) => {
    setEditingIngredientId(id);
    setSaveError(null); // Clear previous errors
  };

  const handleCancelEdit = () => {
    setEditingIngredientId(null);
    setSaveError(null);
  };

  const handleSaveEdit = async (updatedData: Partial<Ingredient>) => {
    if (!editingIngredientId) return;
    
    setIsSaving(true);
    setSaveError(null);
    try {
      const savedIngredient = await updateIngredient(editingIngredientId, updatedData);
      onIngredientUpdate(savedIngredient); // Notify parent component
      setEditingIngredientId(null); // Close form on success
      
      // Show success message with merge info if the ingredient was merged
      if (savedIngredient.id !== editingIngredientId) {
        setSnackbar({
          open: true,
          message: `Ingredient was merged with existing ingredient '${savedIngredient.name}'`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Ingredient '${savedIngredient.name}' updated successfully!`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Failed to save ingredient:", error);
      setSaveError(error instanceof Error ? error.message : "An unknown error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => {
      const valA = a[orderBy as keyof Ingredient];
      const valB = b[orderBy as keyof Ingredient];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [ingredients, order, orderBy]);

  const paginatedIngredients = useMemo(() => {
    return sortedIngredients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedIngredients, page, rowsPerPage]);

  const getTypeChipColor = (type: IngredientType) => {
    switch (type) {
      case IngredientType.SPIRIT: return 'primary';
      case IngredientType.MIXER: return 'secondary';
      case IngredientType.GARNISH: return 'success';
      case IngredientType.BITTER: return 'warning';
      case IngredientType.SYRUP: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader aria-label="ingredients admin table">
          <IngredientAdminTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedIngredients.map((ingredient) => {
              const isEditing = editingIngredientId === ingredient.id;
              return (
                <React.Fragment key={ingredient.id}>
                  {/* Display Row - Only shown when NOT editing */}
                  <TableRow hover style={{ display: isEditing ? 'none' : undefined }}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {ingredient.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ingredient.type.toUpperCase()}
                        color={getTypeChipColor(ingredient.type)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {ingredient.description || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(ingredient.id)} size="small" color="primary" disabled={isSaving}>
                        <Edit />
                      </IconButton>
                      {/* Delete Button Placeholder */}
                    </TableCell>
                  </TableRow>
                  
                  {/* Edit Row - Only shown when editing THIS ingredient */}
                  {isEditing && (
                    <TableRow> 
                      <TableCell colSpan={headCells.length} sx={{ p: 0, borderBottom: 'none' }}>
                        <Collapse in={isEditing} timeout="auto" unmountOnExit>
                          {saveError && (
                            <Alert severity="error" sx={{ m: 1, mb: 0 }}>{saveError}</Alert>
                          )} 
                          <IngredientEditForm 
                            ingredient={ingredient} 
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                            isSaving={isSaving}
                          />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={ingredients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ 
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          flexShrink: 0 
        }}
      />
      <Snackbar
        open={snackbar?.open || false}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
      >
        <Alert 
          onClose={() => setSnackbar(null)} 
          severity={snackbar?.severity || 'success'}
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 