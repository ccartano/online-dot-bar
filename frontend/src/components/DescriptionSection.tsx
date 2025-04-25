import { Box, Divider, Typography } from '@mui/material';
import { sentenceCapitalize } from '../utils/formatting';

interface DescriptionSectionProps {
  title: string;
  content: string | null | undefined;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  sx?: object;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ 
  title, 
  content, 
  variant = 'h4',
  sx = {}
}) => {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography variant={variant} component="h4" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }}/>
      <Typography 
        variant="body1"
        sx={{ 
          whiteSpace: 'pre-line',
          ...sx
        }}
      >
        {sentenceCapitalize(content)}
      </Typography>
    </Box>
  );
}; 