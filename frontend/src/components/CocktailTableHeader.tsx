import React from 'react';
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { Cocktail } from '../services/cocktail.service';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Cocktail | string; // Allow string for non-sortable columns potentially
  label: string;
  sortable: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Cocktail Name', sortable: true, width: '20%' },
  { id: 'ingredients', label: 'Ingredients', sortable: false, width: '20%' },
  { id: 'instructions', label: 'Instructions', sortable: false, width: '30%' },
  { id: 'created', label: 'Added', sortable: true, width: '10%' },
  { id: 'status', label: 'Status', sortable: true, width: '10%' },
  { id: 'actions', label: '', sortable: true, width: '10%' },
];

interface CocktailTableHeaderProps {
  order: Order;
  orderBy: keyof Cocktail | string;
  onRequestSort: (property: keyof Cocktail) => void;
}

export const CocktailTableHeader: React.FC<CocktailTableHeaderProps> = ({
  order,
  orderBy,
  onRequestSort,
}) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell width="5%" />
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            width={headCell.width || 'auto'}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onRequestSort(headCell.id as keyof Cocktail)}
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