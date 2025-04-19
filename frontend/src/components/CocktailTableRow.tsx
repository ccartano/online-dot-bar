import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Ensure the glass type object is properly set
  const cocktailWithGlassType = {
    ...cocktail,
    glassType: cocktail.glassTypeId ? glassTypes.find(gt => gt.id === cocktail.glassTypeId) : undefined,
    glassTypeId: cocktail.glassTypeId
  };

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row expansion if clicking delete button
    if ((event.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    onToggleExpand();
  };

  return (
    <React.Fragment>
      {/* Display Row */}
      <TableRow 
        hover 
        onClick={handleRowClick}
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
          },
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
          },
          // Improve touch target size on mobile
          ...(isMobile && {
            '& > td': {
              minHeight: '48px',
            }
          }),
          // Visual feedback for expanded state
          ...(isExpanded && {
            backgroundColor: 'rgba(0, 0, 0, 0.03) !important',
          })
        }}
      >
        <TableCell width={isMobile ? "60%" : "55%"} sx={{
          padding: isMobile ? '8px' : '16px',
        }}>
          <Typography 
            variant={isMobile ? "body2" : "subtitle1"} 
            fontWeight="medium"
            sx={{ 
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {cocktail.name}
          </Typography>
          {!isMobile && cocktail.ingredients.length > 0 && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {cocktail.ingredients[0]?.ingredient.name} 
              {cocktail.ingredients.length > 1 && ` +${cocktail.ingredients.length - 1} more`}
            </Typography>
          )}
        </TableCell>
        <TableCell width={isMobile ? "25%" : "30%"} sx={{
          padding: isMobile ? '8px' : '16px',
        }}>
          <Chip
            label={cocktail.status.toUpperCase()}
            color={cocktail.status === 'active' ? 'success' : 'warning'}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontWeight: 'bold',
              minWidth: isMobile ? '60px' : '80px',
              maxWidth: '100%',
              justifyContent: 'center'
            }}
          />
        </TableCell>
        <TableCell width="15%" align="right" sx={{
          padding: isMobile ? '8px' : '16px',
        }}>
          {showDelete && (
            <IconButton 
              className="delete-button"
              aria-label="delete cocktail" 
              size={isMobile ? "small" : "medium"}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest?.(cocktail.id);
              }}
              disabled={!onDeleteRequest}
              sx={{
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                }
              }}
            >
              <Delete fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {/* Collapsible Edit Form Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: isMobile ? 1 : 2 }}>
              <CocktailEditForm
                initialCocktail={cocktailWithGlassType}
                glassTypes={glassTypes}
                onSave={onSave}
                onCancel={onToggleExpand}
                onViewThumbnail={onViewThumbnail}
                isMobile={isMobile}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}; 