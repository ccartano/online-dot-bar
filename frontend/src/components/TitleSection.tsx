import { Box, Typography } from '@mui/material';

interface TitleSectionProps {
  title: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  component?: React.ElementType;
  sx?: object;
}

export const TitleSection: React.FC<TitleSectionProps> = ({ 
  title, 
  variant = 'h2', 
  component = 'h2',
  sx = {}
}) => {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography
        variant={variant}
        component={component}
        sx={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'primary.main',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}; 