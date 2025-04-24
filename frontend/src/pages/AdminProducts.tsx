import React, { useState, useEffect } from 'react';
import { Product, productService } from '../services/productService';
import './AdminProducts.css';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      // Convert price strings to numbers
      const productsWithNumericPrices = data.map(product => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
      }));
      setProducts(productsWithNumericPrices);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleOpenModal = (product?: Product) => {
    setCurrentProduct(product || {
      name: '',
      shortDescription: '',
      description: '',
      price: 0,
      imageUrl: '',
      link: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    setIsLoading(true);
    try {
      if (currentProduct.id) {
        await productService.updateProduct(currentProduct.id, currentProduct);
      } else {
        await productService.createProduct(currentProduct as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
      }
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <button onClick={() => handleOpenModal()} className="add-product-btn">
          Add New Product
        </button>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Short Description</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img src={product.imageUrl} alt={product.name} className="admin-product-image" />
                </td>
                <td>{product.name}</td>
                <td>{product.shortDescription}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>
                  <div className="product-actions">
                    <button onClick={() => handleOpenModal(product)}>Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentProduct?.id ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={currentProduct?.name || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  value={currentProduct?.shortDescription || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, shortDescription: e.target.value })}
                  required
                  maxLength={120}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={currentProduct?.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentProduct?.price || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={currentProduct?.imageUrl || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Link</label>
                <input
                  type="url"
                  value={currentProduct?.link || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, link: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 