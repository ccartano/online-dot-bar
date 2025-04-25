import { Box, CircularProgress, Alert } from '@mui/material';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '600px', margin: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
}; 