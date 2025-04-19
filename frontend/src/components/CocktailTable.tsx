import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Cocktail } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';
import { getDocumentThumbnail } from '../services/paperless.service';
import { CocktailTableHeader } from './CocktailTableHeader';
import { CocktailTableRow } from './CocktailTableRow';
import { ThumbnailViewDialog } from './ThumbnailViewDialog';

interface CocktailTableProps {
  cocktails: (Cocktail & { status: 'active' | 'pending' })[];
  onCocktailUpdate: (cocktail: Cocktail) => void;
  glassTypes: GlassType[];
  onDeleteRequest?: (cocktailId: number) => void;
  showDelete?: boolean;
}

export const CocktailTable: React.FC<CocktailTableProps> = ({ 
  cocktails, 
  onCocktailUpdate,
  glassTypes,
  onDeleteRequest,
  showDelete = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  const handleViewThumbnail = async (cocktail: Cocktail) => {
    if (!cocktail.paperlessId) return;

    setImageLoading(true);
    setImageError(null);
    setSelectedCocktail(cocktail);
    setImageModalOpen(true);
    setPreviewUrl(null);

    try {
      const url = await getDocumentThumbnail(cocktail.paperlessId);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error loading image preview:', error);
      setImageError('Failed to load thumbnail');
    } finally {
      setImageLoading(false);
    }
  };

  const handleToggleExpand = (cocktailId: number) => {
    setExpandedRow(prev => (prev === cocktailId ? null : cocktailId));
  };

  const handleSaveCocktail = (updatedCocktail: Cocktail) => {
    onCocktailUpdate(updatedCocktail);
    setExpandedRow(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isPotentialCocktails = cocktails.every(c => c.status === 'pending');
  const displayCocktails = isPotentialCocktails 
    ? cocktails 
    : cocktails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          '& .MuiTableCell-root': {
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
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
          aria-label="cocktail table"
          size={isMobile ? "small" : "medium"}
          sx={{
            tableLayout: 'fixed',
            minWidth: isMobile ? '100%' : '500px'
          }}
        >
          <CocktailTableHeader isMobile={isMobile} />
          <TableBody>
            {displayCocktails.map((cocktail) => (
              <CocktailTableRow
                key={cocktail.id}
                cocktail={cocktail}
                isExpanded={expandedRow === cocktail.id}
                onToggleExpand={() => handleToggleExpand(cocktail.id)}
                onSave={handleSaveCocktail}
                onViewThumbnail={handleViewThumbnail}
                glassTypes={glassTypes}
                onDeleteRequest={onDeleteRequest}
                showDelete={showDelete}
              />
            ))}
          </TableBody>
        </Table>
        {!isPotentialCocktails && (
          <TablePagination
            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
            component="div"
            count={cocktails.length}
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
        )}
      </TableContainer>

      <ThumbnailViewDialog
        open={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setImageError(null);
          setSelectedCocktail(null);
        }}
        cocktail={selectedCocktail}
        imageUrl={previewUrl}
        isLoading={imageLoading}
        error={imageError}
      />
    </>
  );
}; 