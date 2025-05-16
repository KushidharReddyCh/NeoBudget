// frontend/src/pages/CategoriesPage.jsx
import React from 'react';
import CategoryManagement from './CategoryManagement';
import Footer from '../components/Footer';

const CategoriesPage = () => {
  return (
    <div className="categories-page">
      <CategoryManagement />
      <Footer />
    </div>
  );
};

export default CategoriesPage;
