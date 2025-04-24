import React, { useState } from 'react';
import { IngredientAdminPage } from '../components/IngredientAdminPage';

export const AdminPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <IngredientAdminPage 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}; 