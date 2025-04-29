import { Box, Typography, List, ListItem, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface RelatedItem {
  id: number;
  name: string;
  slug: string;
}

interface RelatedItemsListProps {
  title: string;
  items: RelatedItem[];
  basePath: string;
}

export const RelatedItemsList: React.FC<RelatedItemsListProps> = ({ title, items, basePath }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <List>
        {items.map((item) => (
          <ListItem key={item.id} sx={{ pl: 0 }}>
            <Link
              component={RouterLink}
              to={`${basePath}/${item.slug}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {item.name}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 