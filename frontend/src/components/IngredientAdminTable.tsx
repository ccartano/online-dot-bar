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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Ingredient } from '../types/ingredient.types';
import { IngredientType, INGREDIENT_TYPE_LABELS } from '../utils/constants';
import { IngredientEditForm } from './IngredientEditForm';
import { updateIngredient, deleteIngredient } from '../services/ingredient.service';
import SearchIcon from '@mui/icons-material/Search';
import { formatIngredientType } from '../utils/ingredientUtils';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Ingredient | string;
  label: string;
  sortable: boolean;
  width: string;
  hideOnMobile?: boolean;
}

// --- Main Table Component --- 

interface IngredientAdminTableProps {
  ingredients: Ingredient[];
  onIngredientUpdate: (updatedIngredient: Ingredient) => void;
  onIngredientDelete: (deletedIngredient: Ingredient) => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IngredientAdminTable: React.FC<IngredientAdminTableProps> = ({ 
  ingredients, 
  onIngredientUpdate,
  onIngredientDelete,
  searchTerm,
  onSearchChange
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const headCells: HeadCell[] = [
    { id: 'name', label: 'Name', sortable: true, width: isMobile ? '40%' : '25%' },
    { id: 'type', label: 'Type', sortable: true, width: isMobile ? '30%' : '15%' },
    { id: 'description', label: 'Description', sortable: false, width: isMobile ? '0%' : '35%', hideOnMobile: true },
    { id: 'imageUrl', label: 'Image URL', sortable: false, width: isMobile ? '0%' : '25%', hideOnMobile: true },
    { id: 'actions', label: 'Actions', sortable: false, width: isMobile ? '30%' : '20%' }, 
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

  const handleDeleteClick = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setIngredientToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;

    setIsDeleting(true);
    try {
      await deleteIngredient(ingredientToDelete.id);
      onIngredientDelete(ingredientToDelete); // Notify parent to refresh list
      setSnackbar({
        open: true,
        message: `Ingredient '${ingredientToDelete.name}' deleted successfully!`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete ingredient',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      handleCloseDeleteDialog();
    }
  };

  const filteredAndSortedIngredients = useMemo(() => {
    let filtered = [...ingredients];
    
    // Apply search filter if search term exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ingredient => 
        ingredient.name.toLowerCase().includes(searchLower) ||
        ingredient.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    filtered = filtered.filter(ingredient => 
      typeFilter === 'all' || ingredient.type === typeFilter
    );
    
    // Apply sorting
    return filtered.sort((a, b) => {
      const valA = a[orderBy as keyof Ingredient];
      const valB = b[orderBy as keyof Ingredient];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [ingredients, order, orderBy, typeFilter, searchTerm]);

  const paginatedIngredients = useMemo(() => {
    return filteredAndSortedIngredients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAndSortedIngredients, page, rowsPerPage]);

  const getTypeColor = (type: IngredientType): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' => {
    switch (type) {
      case IngredientType.SPIRIT: return 'primary';
      case IngredientType.LIQUEUR: return 'secondary';
      case IngredientType.FORTIFIED_WINE: return 'error';
      case IngredientType.APERITIF_DIGESTIF: return 'error';
      case IngredientType.AROMATIC_BITTER: return 'warning';
      case IngredientType.CITRUS_BITTER: return 'warning';
      case IngredientType.HERBAL_BITTER: return 'warning';
      case IngredientType.CARBONATED_MIXER: return 'info';
      case IngredientType.JUICE: return 'info';
      case IngredientType.DAIRY: return 'info';
      case IngredientType.HOT_BEVERAGE: return 'info';
      case IngredientType.SIMPLE_SYRUP: return 'success';
      case IngredientType.FLAVORED_SYRUP: return 'success';
      case IngredientType.SPECIALTY_SYRUP: return 'success';
      case IngredientType.FRUIT_GARNISH: return 'success';
      case IngredientType.HERB_GARNISH: return 'success';
      case IngredientType.SPICE_GARNISH: return 'success';
      case IngredientType.OTHER_GARNISH: return 'success';
      case IngredientType.WINE: return 'error';
      case IngredientType.ENHANCERS: return 'warning';
      case IngredientType.OTHER: return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 120 }}>
          <InputLabel id="type-filter-label">Filter by Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => {
              setTypeFilter(e.target.value as IngredientType | 'all');
              setPage(0);
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.values(IngredientType).map((type) => (
              <MenuItem key={type.toString()} value={type}>
                {INGREDIENT_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%',
          overflowX: 'auto',
          '& .MuiTableCell-root': {
            padding: isMobile ? '8px' : '16px',
            fontSize: isMobile ? '0.875rem' : '1rem',
          }
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="left"
                  padding="normal"
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{ 
                    width: headCell.width,
                    fontWeight: 'bold',
                    display: isMobile && headCell.hideOnMobile ? 'none' : 'table-cell'
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as keyof Ingredient)}
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
          <TableBody>
            {paginatedIngredients.map((ingredient) => {
              const isEditing = editingIngredientId === ingredient.id;
              return (
                <React.Fragment key={ingredient.id}>
                  <TableRow hover style={{ display: isEditing ? 'none' : undefined }}>
                    <TableCell 
                      width={isMobile ? "40%" : "25%"}
                      sx={{ 
                        display: isMobile ? 'table-cell' : 'table-cell',
                        '& .MuiTypography-root': {
                          fontSize: isMobile ? '0.875rem' : '1rem'
                        }
                      }}
                    >
                      <Typography 
                        variant={isMobile ? "body2" : "subtitle1"} 
                        fontWeight="medium"
                        sx={{ 
                          color: 'text.primary',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ingredient.name}
                      </Typography>
                    </TableCell>
                    <TableCell 
                      width={isMobile ? "30%" : "15%"}
                      sx={{ 
                        display: isMobile ? 'table-cell' : 'table-cell',
                        '& .MuiChip-root': {
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          height: isMobile ? '24px' : '32px'
                        }
                      }}
                    >
                      <Chip
                        label={formatIngredientType(ingredient.type)}
                        color={getTypeColor(ingredient.type)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          fontWeight: 'bold',
                          minWidth: isMobile ? '60px' : '80px',
                          maxWidth: '100%',
                          justifyContent: 'center'
                        }}
                      />
                    </TableCell>
                    <TableCell 
                      width={isMobile ? "0%" : "35%"}
                      sx={{ 
                        display: isMobile ? 'none' : 'table-cell',
                        maxWidth: '35%',
                        minWidth: '200px',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        padding: isMobile ? '8px' : '16px'
                      }}
                    >
                      <Typography 
                        variant={isMobile ? "body2" : "subtitle1"} 
                        sx={{ 
                          color: 'text.secondary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxHeight: '3em',
                          lineHeight: '1.5em',
                          whiteSpace: 'normal'
                        }}
                      >
                        {ingredient.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell 
                      width={isMobile ? "0%" : "25%"}
                      sx={{ display: isMobile ? 'none' : 'table-cell' }}
                    >
                      <Typography 
                        variant={isMobile ? "body2" : "subtitle1"} 
                        sx={{ 
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ingredient.imageUrl || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell 
                      width={isMobile ? "30%" : "20%"} 
                      sx={{ 
                        minWidth: isMobile ? '80px' : '120px',
                        '& .MuiIconButton-root': {
                          padding: isMobile ? '4px' : '8px'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5,
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                      }}>
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
                          <Edit fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteClick(ingredient)} 
                          size={isMobile ? "small" : "medium"} 
                          color="error"
                          disabled={isDeleting}
                          sx={{
                            backgroundColor: 'rgba(244, 67, 54, 0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            }
                          }}
                        >
                          <Delete fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Box>
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
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Ingredient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the ingredient "{ingredientToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
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