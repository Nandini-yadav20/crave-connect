import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaStar, FaClock, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdLocalOffer } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState({ restaurants: [], menuItems: [] });

  useEffect(() => {
    fetchRestaurantDetails();
    fetchFavorites();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRestaurant(response.data.data.restaurant);
        setMenuItems(response.data.data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFavorites(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${serverUrl}/api/cart/add`,
        {
          menuItemId: item._id,
          quantity: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const toggleFavoriteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.menuItems.some(fav => fav._id === itemId);
      
      if (isFavorite) {
        await axios.delete(`${serverUrl}/api/favorites/menuitem/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Removed from favorites');
      } else {
        await axios.post(
          `${serverUrl}/api/favorites/menuitem/${itemId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Added to favorites');
      }
      
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const toggleFavoriteRestaurant = async () => {
    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.restaurants.some(fav => fav._id === restaurant._id);
      
      if (isFavorite) {
        await axios.delete(`${serverUrl}/api/favorites/restaurant/${restaurant._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Restaurant removed from favorites');
      } else {
        await axios.post(
          `${serverUrl}/api/favorites/restaurant/${restaurant._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Restaurant added to favorites');
      }
      
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling restaurant favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const isRestaurantFavorite = restaurant && favorites.restaurants.some(fav => fav._id === restaurant._id);

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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <div className="text-center py-20">
          <p className="text-gray-500">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="w-full md:w-1/3">
              <div className="h-48 md:h-full bg-gray-200 rounded-lg overflow-hidden">
                {restaurant.image ? (
                  <img
                    src={`${serverUrl}/uploads/${restaurant.image}`}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff4d2d]/20 to-[#ff4d2d]/10">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-gray-600 mb-3">{restaurant.description}</p>
                </div>
                
                <button
                  onClick={toggleFavoriteRestaurant}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  {isRestaurantFavorite ? (
                    <FaHeart className="text-[#ff4d2d]" size={24} />
                  ) : (
                    <FaRegHeart className="text-gray-400" size={24} />
                  )}
                </button>
              </div>

              {/* Cuisine Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.cuisine.map((c, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({restaurant.totalReviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <FaClock />
                  <span>{restaurant.deliveryTime}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt />
                  <span>{restaurant.address.city}, {restaurant.address.state}</span>
                </div>
              </div>

              {/* Status & Min Order */}
              <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-lg ${
                  restaurant.isOpen 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {restaurant.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </div>
                
                {restaurant.minimumOrder > 0 && (
                  <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
                    Min Order: ₹{restaurant.minimumOrder}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>

          {/* Category Filter */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-[#ff4d2d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isFavorite = favorites.menuItems.some(fav => fav._id === item._id);
              
              return (
                <div
                  key={item._id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={`${serverUrl}/uploads/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      
                      <button
                        onClick={() => toggleFavoriteItem(item._id)}
                        className="ml-2"
                      >
                        {isFavorite ? (
                          <FaHeart className="text-[#ff4d2d]" />
                        ) : (
                          <FaRegHeart className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#ff4d2d]">
                          ₹{item.price}
                        </span>
                        
                        {item.discount > 0 && (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <MdLocalOffer />
                            {item.discount}% OFF
                          </span>
                        )}

                        <span className={`text-xs px-2 py-1 rounded ${
                          item.isVeg 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable || !restaurant.isOpen}
                        className="px-6 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!item.isAvailable ? 'Unavailable' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No items in this category
            </div>
          )}
        </div>

        {/* View Cart Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-[#ff4d2d] text-white rounded-full font-semibold shadow-lg hover:bg-[#e64323] transition flex items-center gap-2"
          >
            <span>View Cart</span>
            <span className="bg-white text-[#ff4d2d] px-2 py-1 rounded-full text-sm">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;