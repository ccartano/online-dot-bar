import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Cocktail } from '../types/cocktail.types';

interface ThumbnailViewDialogProps {
  open: boolean;
  onClose: () => void;
  cocktail: Cocktail | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ThumbnailViewDialog: React.FC<ThumbnailViewDialogProps> = ({
  open,
  onClose,
  cocktail,
  imageUrl,
  isLoading,
  error,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Thumbnail for {cocktail?.name}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={`Thumbnail for ${cocktail?.name}`}
            sx={{
              maxWidth: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
            }}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 