import React, { useState, useEffect } from 'react';
import { Cocktail, cocktailService } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';
import { CocktailEditForm } from '../components/CocktailEditForm';
import './AdminCocktails.css';

const AdminCocktails: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCocktail, setCurrentCocktail] = useState<Partial<Cocktail> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);

  useEffect(() => {
    fetchCocktails();
    fetchGlassTypes();
  }, []);

  const fetchCocktails = async () => {
    try {
      const data = await cocktailService.getAllCocktails();
      setCocktails(data);
    } catch (error) {
      console.error('Error fetching cocktails:', error);
    }
  };

  const fetchGlassTypes = async () => {
    try {
      const response = await fetch('/api/glass-types');
      const data = await response.json();
      setGlassTypes(data);
    } catch (error) {
      console.error('Error fetching glass types:', error);
    }
  };

  const handleOpenModal = (cocktail?: Cocktail) => {
    setCurrentCocktail(cocktail || {
      name: '',
      description: '',
      instructions: '',
      imageUrl: '',
      ingredients: [],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCocktail(null);
  };

  const handleSubmit = async (updatedCocktail: Cocktail) => {
    setIsLoading(true);
    try {
      if (updatedCocktail.id) {
        await cocktailService.updateCocktail(updatedCocktail.id, updatedCocktail);
      } else {
        await cocktailService.createCocktail(updatedCocktail as Omit<Cocktail, 'id' | 'createdAt' | 'updatedAt'>);
      }
      await fetchCocktails();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving cocktail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this cocktail?')) {
      try {
        await cocktailService.deleteCocktail(id);
        await fetchCocktails();
      } catch (error) {
        console.error('Error deleting cocktail:', error);
      }
    }
  };

  return (
    <div className="admin-cocktails">
      <div className="admin-cocktails-header">
        <button onClick={() => handleOpenModal()} className="add-cocktail-btn">
          Create Custom Cocktail
        </button>
      </div>

      <div className="cocktails-table-container">
        <table className="cocktails-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Glass Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cocktails.map((cocktail) => (
              <tr key={cocktail.id}>
                <td data-label="Name">{cocktail.name}</td>
                <td data-label="Description">{cocktail.description}</td>
                <td data-label="Glass Type">{cocktail.glassType?.name || 'N/A'}</td>
                <td data-label="Actions">
                  <div className="cocktail-actions">
                    <button onClick={() => handleOpenModal(cocktail)}>Edit</button>
                    <button onClick={() => handleDelete(cocktail.id)} className="delete-btn">
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
            <h2>{currentCocktail?.id ? 'Edit Cocktail' : 'Create Custom Cocktail'}</h2>
            <CocktailEditForm
              initialCocktail={currentCocktail as Cocktail}
              glassTypes={glassTypes}
              onSave={handleSubmit}
              onCancel={handleCloseModal}
              onViewThumbnail={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCocktails; 