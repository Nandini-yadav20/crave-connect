import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { MdFastfood } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddMenuItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main-course',
    price: '',
    isVeg: true,
    preparationTime: 15,
    discount: 0,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchMenuItem();
    }
  }, [id]);

  const fetchMenuItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/owner/menu-items`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const item = response.data.data.find(item => item._id === id);
        if (item) {
          setFormData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'main-course',
            price: item.price || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            preparationTime: item.preparationTime || 15,
            discount: item.discount || 0,
            tags: item.tags || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching menu item:', error);
      toast.error('Failed to load menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (formData.discount < 0 || formData.discount > 100) {
      toast.error('Discount must be between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isEdit
        ? `${serverUrl}/api/owner/menu-items/${id}`
        : `${serverUrl}/api/owner/menu-items`;
      
      const method = isEdit ? 'put' : 'post';

      const response = await axios[method](
        endpoint,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(isEdit ? 'Item updated successfully!' : 'Item added successfully!');
        setTimeout(() => {
          navigate('/owner/menu');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/owner/menu')}
            className="flex items-center gap-2 text-[#ff4d2d] hover:underline mb-4"
          >
            <FiArrowLeft />
            Back to Menu
          </button>
          
          <div className="flex items-center gap-3">
            <MdFastfood className="text-[#ff4d2d]" size={36} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Update item details' : 'Add a new dish to your menu'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your dish..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Type *
                  </label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={formData.isVeg === true}
                        onChange={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                        className="w-4 h-4 text-[#ff4d2d]"
                      />
                      <span className="text-sm">🟢 Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={formData.isVeg === false}
                        onChange={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                        className="w-4 h-4 text-[#ff4d2d]"
                      />
                      <span className="text-sm">🔴 Non-Vegetarian</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {formData.discount > 0 && formData.price > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Final Price: <span className="font-bold">₹{(formData.price * (1 - formData.discount / 100)).toFixed(2)}</span>
                  <span className="ml-2 line-through text-green-600">₹{formData.price}</span>
                </p>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                placeholder="15"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tags</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-2 bg-[#ff4d2d] text-white px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g., spicy, bestseller)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/owner/menu')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>{isEdit ? 'Update Item' : 'Add Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMenuItem;