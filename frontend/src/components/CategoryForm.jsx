// frontend/src/components/CategoryForm.jsx
import React, { useState } from "react";
import { FaTags } from "react-icons/fa";

const CategoryForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    category: initialData?.category || "",
    sub_category: initialData?.sub_category || "",
    budget: initialData?.budget || "",
    month: initialData?.month || "",
    year: initialData?.year || new Date().getFullYear().toString(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h3>
        <FaTags /> {initialData ? "Edit Category" : "Add Category"}
      </h3>

      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Sub Category</label>
        <input
          type="text"
          value={formData.sub_category}
          onChange={(e) =>
            setFormData({ ...formData, sub_category: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Budget</label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) =>
            setFormData({ ...formData, budget: parseFloat(e.target.value) })
          }
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {initialData ? "Update Category" : "Add Category"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
