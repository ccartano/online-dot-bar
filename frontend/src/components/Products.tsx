import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Product } from '../services/productService';
import './Products.css';

interface ProductsProps {
  products: Product[];
}

const Products: React.FC<ProductsProps> = ({ products }) => {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <Card key={product.id} className="product-card">
          <CardMedia
            component="img"
            height="200"
            image={product.imageUrl}
            alt={product.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.shortDescription}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              color="primary"
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Amazon
            </Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default Products; 