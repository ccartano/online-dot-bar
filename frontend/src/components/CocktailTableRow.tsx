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
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
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
}

export const CocktailTableRow: React.FC<CocktailTableRowProps> = ({
  cocktail,
  isExpanded,
  onToggleExpand,
  onSave,
  onViewThumbnail,
  glassTypes,
}) => {
  return (
    <React.Fragment>
      {/* Display Row */}
      <TableRow hover onClick={onToggleExpand} sx={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small">
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
      </TableRow>

      {/* Collapsible Edit Form Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <CocktailEditForm
                initialCocktail={cocktail}
                glassTypes={glassTypes}
                onSave={(updatedCocktail) => {
                  onSave(updatedCocktail);
                  // Expansion is controlled by parent, save callback handles closing
                }}
                onCancel={onToggleExpand} // Simply toggle expand to cancel/close
                onViewThumbnail={onViewThumbnail}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}; 