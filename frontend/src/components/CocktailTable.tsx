import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
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

type Order = 'asc' | 'desc';

export const CocktailTable: React.FC<CocktailTableProps> = ({ 
  cocktails, 
  onCocktailUpdate,
  glassTypes,
  onDeleteRequest,
  showDelete = true
}) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Cocktail | string>('createdAt');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleRequestSort = (property: keyof Cocktail) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      if (orderBy === 'createdAt') {
        const dateA = (a.createdAt || a.created || '') ? new Date(a.createdAt || a.created || '').getTime() : 0;
        const dateB = (b.createdAt || b.created || '') ? new Date(b.createdAt || b.created || '').getTime() : 0;
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [cocktails, order, orderBy]);

  const paginatedCocktails = React.useMemo(() => {
    return sortedCocktails.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedCocktails, page, rowsPerPage]);

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

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          overflow: 'auto',
          '& .MuiTableCell-root': {
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          },
        }}
      >
        <Table
          stickyHeader
          aria-label="cocktail table"
          sx={{
            tableLayout: 'fixed',
            minWidth: '100%',
          }}
        >
          <CocktailTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedCocktails.map((cocktail) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={cocktails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            zIndex: 1
          }}
        />
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