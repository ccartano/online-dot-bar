import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Products from './Products';
import { SEO } from './SEO';
import { getProducts } from '../services/productService';
import { Product } from '../types/product';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <SEO 
        title="Products | Online Bar"
        description="Browse our selection of bar products and accessories"
      />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Products
          </Typography>
          <Products products={products} />
        </Box>
      </Container>
    </>
  );
};

export default ProductsPage; 