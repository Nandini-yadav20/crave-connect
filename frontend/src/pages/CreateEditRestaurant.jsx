import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateEditRestaurant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: [],
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    minimumOrder: 0,
    deliveryTime: '30-40 mins'
  });

  const [cuisineInput, setCuisineInput] = useState('');

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Continental', 'Fast Food',
    'Mexican', 'Thai', 'Japanese', 'American', 'Mediterranean',
    'Korean', 'Desserts', 'Beverages', 'Bakery', 'Street Food'
  ];

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/owner/restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsEdit(true);
        const restaurant = response.data.data;
        setFormData({
          name: restaurant.name || '',
          description: restaurant.description || '',
          cuisine: restaurant.cuisine || [],
          phone: restaurant.phone || '',
          address: {
            street: restaurant.address?.street || '',
            city: restaurant.address?.city || '',
            state: restaurant.address?.state || '',
            zipCode: restaurant.address?.zipCode || '',
            coordinates: restaurant.address?.coordinates || {
              latitude: 19.0760,
              longitude: 72.8777
            }
          },
          minimumOrder: restaurant.minimumOrder || 0,
          deliveryTime: restaurant.deliveryTime || '30-40 mins'
        });
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setIsEdit(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const addCuisine = (cuisine) => {
    if (cuisine && !formData.cuisine.includes(cuisine)) {
      setFormData(prev => ({
        ...prev,
        cuisine: [...prev.cuisine, cuisine]
      }));
      setCuisineInput('');
    }
  };

  const removeCuisine = (cuisineToRemove) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(c => c !== cuisineToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Restaurant name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return false;
    }
    if (formData.cuisine.length === 0) {
      toast.error('Please select at least one cuisine');
      return false;
    }
    if (!formData.address.street.trim()) {
      toast.error('Street address is required');
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.address.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (!formData.address.zipCode.trim()) {
      toast.error('ZIP code is required');
      return false;
    }
    if (formData.address.zipCode.length !== 6) {
      toast.error('ZIP code must be 6 digits');
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
        ? `${serverUrl}/api/owner/restaurant` 
        : `${serverUrl}/api/owner/restaurant`;
      
      const method = isEdit ? 'put' : 'post';

      const response = await axios[method](
        endpoint,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(isEdit ? 'Restaurant updated successfully!' : 'Restaurant created successfully!');
        setTimeout(() => {
          navigate('/owner/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(error.response?.data?.message || 'Failed to save restaurant');
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
            onClick={() => navigate('/owner/dashboard')}
            className="flex items-center gap-2 text-[#ff4d2d] hover:underline mb-4"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <MdRestaurant className="text-[#ff4d2d]" size={36} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEdit ? 'Edit Restaurant' : 'Create Restaurant'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Update your restaurant details' : 'Set up your restaurant profile'}
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
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
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
                  placeholder="Describe your restaurant..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cuisine Types *</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.cuisine.map((cuisine) => (
                <span
                  key={cuisine}
                  className="flex items-center gap-2 bg-[#ff4d2d] text-white px-3 py-1 rounded-full text-sm"
                >
                  {cuisine}
                  <button
                    type="button"
                    onClick={() => removeCuisine(cuisine)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => addCuisine(cuisine)}
                  disabled={formData.cuisine.includes(cuisine)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    formData.cuisine.includes(cuisine)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#ff4d2d]/10 hover:text-[#ff4d2d]'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Address</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Building, Street Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  placeholder="6-digit ZIP code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time
                </label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="e.g., 30-40 mins"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/owner/dashboard')}
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
                  <span>{isEdit ? 'Update Restaurant' : 'Create Restaurant'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEditRestaurant;