import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App.jsx';
import Nav from '../components/Nav.jsx';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdFastfood } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageMenu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const categories = [
    'all',
    'appetizer',
    'main-course',
    'dessert',
    'beverage',
    'snacks',
    'breakfast',
    'lunch',
    'dinner'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, [filter]);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?category=${filter}` : '';
      
      const response = await axios.get(
        `${serverUrl}/api/owner/menu-items${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/owner/menu-items/${itemId}/toggle-availability`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Availability updated');
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${serverUrl}/api/owner/menu-items/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Menu item deleted');
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
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
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Menu</h1>
            <p className="text-gray-600">
              {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'} in your menu
            </p>
          </div>

          <button
            onClick={() => navigate('/owner/menu/add')}
            className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition flex items-center gap-2 justify-center"
          >
            <FiPlus size={20} />
            Add Menu Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === category
                    ? 'bg-[#ff4d2d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MdFastfood className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'all' ? 'No menu items yet' : `No ${filter} items`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding delicious items to your menu
            </p>
            <button
              onClick={() => navigate('/owner/menu/add')}
              className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.image ? (
                    <img
                      src={`${serverUrl}/uploads/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🍽️
                    </div>
                  )}
                  
                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleAvailability(item._id)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${
                      item.isAvailable
                        ? 'bg-green-500/90 hover:bg-green-600'
                        : 'bg-red-500/90 hover:bg-red-600'
                    } transition`}
                  >
                    {item.isAvailable ? (
                      <FiEye className="text-white" />
                    ) : (
                      <FiEyeOff className="text-white" />
                    )}
                  </button>

                  {/* Veg/Non-Veg Badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${
                    item.isVeg
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </div>

                  {/* Discount Badge */}
                  {item.discount > 0 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {item.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.category.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-[#ff4d2d]">₹{item.price}</p>
                      {item.discount > 0 && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{Math.round(item.price / (1 - item.discount / 100))}
                        </p>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/owner/menu/edit/${item._id}`)}
                      className="flex-1 px-4 py-2 border-2 border-[#ff4d2d] text-[#ff4d2d] rounded-lg font-semibold hover:bg-[#ff4d2d]/5 transition flex items-center justify-center gap-2"
                    >
                      <FiEdit size={16} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageMenu;