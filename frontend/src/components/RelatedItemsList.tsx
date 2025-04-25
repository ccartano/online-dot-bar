import { Box, List, ListItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { titleize } from '../utils/formatting';

interface RelatedItem {
  id: number;
  name: string;
  slug?: string;
}

interface RelatedItemsListProps {
  title: string;
  items: RelatedItem[];
  basePath?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  sx?: object;
}

export const RelatedItemsList: React.FC<RelatedItemsListProps> = ({ 
  title, 
  items, 
  basePath,
  variant = 'h4',
  sx = {}
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography variant={variant} component="h4" gutterBottom>
        {title}
      </Typography>
      <List dense>
        {items.map(item => (
          <ListItem key={item.id}>
            {basePath && item.slug ? (
              <Link 
                to={`${basePath}/${item.slug}`} 
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  width: '100%'
                }}
              >
                <Typography variant="body1">{titleize(item.name)}</Typography>
              </Link>
            ) : (
              <Typography variant="body1">{titleize(item.name)}</Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 