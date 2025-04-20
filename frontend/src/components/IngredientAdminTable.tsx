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
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

interface IngredientAdminTableHeaderProps {
  order: Order;
  orderBy: keyof Ingredient | string;
  onRequestSort: (property: keyof Ingredient) => void;
  headCells: HeadCell[];
}

const IngredientAdminTableHeader: React.FC<IngredientAdminTableHeaderProps> = (props) => {
  const { order, orderBy, onRequestSort, headCells } = props;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Ingredient | string>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [typeFilter, setTypeFilter] = useState<IngredientType | 'all'>('all');

  const headCells: HeadCell[] = [
    { id: 'name', label: 'Name', sortable: true, width: isMobile ? '50%' : '45%' },
    { id: 'type', label: 'Type', sortable: true, width: isMobile ? '30%' : '35%' },
    { id: 'actions', label: 'Actions', sortable: false, width: isMobile ? '20%' : '20%' }, 
  ];

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

  const filteredAndSortedIngredients = useMemo(() => {
    return [...ingredients]
      .filter(ingredient => typeFilter === 'all' || ingredient.type === typeFilter)
      .sort((a, b) => {
        const valA = a[orderBy as keyof Ingredient];
        const valB = b[orderBy as keyof Ingredient];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [ingredients, order, orderBy, typeFilter]);

  const paginatedIngredients = useMemo(() => {
    return filteredAndSortedIngredients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAndSortedIngredients, page, rowsPerPage]);

  const getTypeChipColor = (type: IngredientType) => {
    switch (type) {
      case IngredientType.SPIRIT: return 'primary';
      case IngredientType.LIQUEUR: return 'secondary';
      case IngredientType.MIXER: return 'info';
      case IngredientType.GARNISH: return 'success';
      case IngredientType.BITTER: return 'warning';
      case IngredientType.SYRUP: return 'error';
      case IngredientType.WINE: return 'primary';
      case IngredientType.ENHANCERS: return 'secondary';
      case IngredientType.OTHER: return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="type-filter-label">Filter by Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => {
              setTypeFilter(e.target.value as IngredientType | 'all');
              setPage(0); // Reset to first page when filter changes
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.values(IngredientType).map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          flexGrow: 1,
          '& .MuiTableCell-root': {
            padding: isMobile ? '12px 8px' : '16px',
            fontSize: isMobile ? '0.9rem' : '1rem',
            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            minWidth: isMobile ? '80px' : '120px'
          },
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '&:nth-of-type(odd)': {
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
            }
          }
        }}
      >
        <Table 
          stickyHeader 
          aria-label="ingredients admin table" 
          size={isMobile ? "small" : "medium"}
          sx={{
            tableLayout: 'fixed',
            minWidth: isMobile ? '100%' : '500px'  // Reduced minimum width since we have fewer columns
          }}
        >
          <IngredientAdminTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            headCells={headCells}
          />
          <TableBody>
            {paginatedIngredients.map((ingredient) => {
              const isEditing = editingIngredientId === ingredient.id;
              return (
                <React.Fragment key={ingredient.id}>
                  {/* Display Row - Only shown when NOT editing */}
                  <TableRow hover style={{ display: isEditing ? 'none' : undefined }}>
                    <TableCell width={isMobile ? "50%" : "45%"}>
                      <Typography 
                        variant={isMobile ? "body2" : "subtitle1"} 
                        fontWeight="medium"
                        sx={{ 
                          color: 'text.primary',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {ingredient.name}
                      </Typography>
                    </TableCell>
                    <TableCell width={isMobile ? "30%" : "35%"}>
                      <Chip
                        label={ingredient.type.toUpperCase()}
                        color={getTypeChipColor(ingredient.type)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          fontWeight: 'bold',
                          minWidth: isMobile ? '60px' : '80px',
                          maxWidth: '100%',
                          justifyContent: 'center'
                        }}
                      />
                    </TableCell>
                    <TableCell width={isMobile ? "20%" : "20%"}>
                      <IconButton 
                        onClick={() => handleEditClick(ingredient.id)} 
                        size={isMobile ? "small" : "medium"} 
                        color="primary" 
                        disabled={isSaving}
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  {/* Edit Row */}
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
                            isMobile={isMobile}
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredAndSortedIngredients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: isMobile ? '0.9rem' : '1rem'
          }
        }}
      />
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}; 