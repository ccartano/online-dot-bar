import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { AdminService } from './admin.service';

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrl: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

const getHeaders = () => {
  const adminToken = AdminService.getAdminToken();
  return {
    'x-admin-token': adminToken || '',
  };
};

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await axios.get(getApiUrl('/products'), {
      headers: getHeaders(),
    });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await axios.get(getApiUrl(`/products/${id}`), {
      headers: getHeaders(),
    });
    return response.data;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await axios.post(getApiUrl('/products'), product, {
      headers: getHeaders(),
    });
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await axios.put(getApiUrl(`/products/${id}`), product, {
      headers: getHeaders(),
    });
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(getApiUrl(`/products/${id}`), {
      headers: getHeaders(),
    });
  },
}; 