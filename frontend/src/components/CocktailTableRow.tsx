import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Delete } from '@mui/icons-material';
import { Cocktail } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';
import { CocktailEditForm } from './CocktailEditForm';

interface CocktailTableRowProps {
  cocktail: Cocktail & { status: 'active' | 'pending' };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: (updatedCocktail: Cocktail) => void;
  onViewThumbnail: (cocktail: Cocktail) => void;
  glassTypes: GlassType[];
  onDeleteRequest?: (cocktailId: number) => void;
  showDelete?: boolean;
}

export const CocktailTableRow: React.FC<CocktailTableRowProps> = ({
  cocktail,
  isExpanded,
  onToggleExpand,
  onSave,
  onViewThumbnail,
  glassTypes,
  onDeleteRequest,
  showDelete = true,
}) => {
  // Ensure the glass type object is properly set
  const cocktailWithGlassType: Cocktail & { status: 'active' | 'pending' } = {
    ...cocktail,
    glassType: cocktail.glassTypeId ? glassTypes.find(gt => gt.id === cocktail.glassTypeId) || undefined : undefined
  };

  return (
    <React.Fragment>
      {/* Display Row */}
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={onToggleExpand}>
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle1" fontWeight="medium">
            {cocktail.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {cocktail.ingredients[0]?.ingredient.name} and {cocktail.ingredients.length - 1} more
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
        {showDelete && (
          <TableCell align="right">
            <IconButton 
              aria-label="delete cocktail" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest?.(cocktail.id);
              }}
              disabled={!onDeleteRequest}
            >
              <Delete fontSize="small" />
            </IconButton>
          </TableCell>
        )}
        {!showDelete && <TableCell />}
      </TableRow>

      {/* Collapsible Edit Form Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={showDelete ? 7 : 6}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <CocktailEditForm
                initialCocktail={cocktailWithGlassType}
                glassTypes={glassTypes}
                onSave={(updatedCocktail) => {
                  onSave(updatedCocktail);
                }}
                onCancel={onToggleExpand}
                onViewThumbnail={onViewThumbnail}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}; 