import React from 'react';
import {
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Cocktail } from '../services/cocktail.service';

interface HeadCell {
  id: keyof Cocktail | string;
  label: string;
  width?: string;
}

interface CocktailTableHeaderProps {
  isMobile?: boolean;
}

export const CocktailTableHeader: React.FC<CocktailTableHeaderProps> = ({
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const isMobile = propIsMobile ?? useMediaQuery(theme.breakpoints.down('sm'));

  const headCells: HeadCell[] = [
    { id: 'name', label: 'Name', width: isMobile ? '60%' : '55%' },
    { id: 'status', label: 'Status', width: isMobile ? '25%' : '30%' },
    { id: 'actions', label: '', width: '15%' },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            width={headCell.width || 'auto'}
            sx={{
              padding: isMobile ? '8px' : '16px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: 'bold',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant={isMobile ? "body2" : "subtitle2"}
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {headCell.label}
            </Typography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}; 