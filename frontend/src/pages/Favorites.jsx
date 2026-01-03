import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaHeart, FaStar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { MdLocalOffer } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({
    restaurants: [],
    menuItems: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'items'

  useEffect(() => {
    fetchFavorites();
  }, []);

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
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurant = async (restaurantId) => {
    if (!window.confirm('Remove this restaurant from favorites?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${serverUrl}/api/favorites/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFavorites(response.data.data);
        toast.success('Restaurant removed from favorites');
      }
    } catch (error) {
      console.error('Error removing restaurant:', error);
      toast.error('Failed to remove restaurant');
    }
  };

  const removeMenuItem = async (menuItemId) => {
    if (!window.confirm('Remove this item from favorites?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${serverUrl}/api/favorites/menuitem/${menuItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFavorites(response.data.data);
        toast.success('Item removed from favorites');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const addToCart = async (menuItem) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${serverUrl}/api/cart/add`,
        {
          menuItemId: menuItem._id,
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

  const hasRestaurants = favorites.restaurants && favorites.restaurants.length > 0;
  const hasMenuItems = favorites.menuItems && favorites.menuItems.length > 0;
  const hasFavorites = hasRestaurants || hasMenuItems;

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaHeart className="text-[#ff4d2d]" />
            My Favorites
          </h1>
          <p className="text-gray-600">
            Your saved restaurants and menu items
          </p>
        </div>

        {/* Empty State */}
        {!hasFavorites ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-[#ff4d2d]" size={48} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No favorites yet
            </h2>
            
            <p className="text-gray-600 mb-6">
              Start adding your favorite restaurants and dishes
            </p>
            
            <button
              onClick={() => navigate('/restaurants')}
              className="px-8 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'restaurants'
                    ? 'bg-[#ff4d2d] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } shadow-md`}
              >
                <span>🍽️</span>
                <span>Restaurants</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {favorites.restaurants?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'items'
                    ? 'bg-[#ff4d2d] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } shadow-md`}
              >
                <span>🍕</span>
                <span>Menu Items</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {favorites.menuItems?.length || 0}
                </span>
              </button>
            </div>

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <div>
                {hasRestaurants ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.restaurants.map((restaurant) => (
                      <div
                        key={restaurant._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group relative"
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => removeRestaurant(restaurant._id)}
                          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition group/btn"
                        >
                          <FiTrash2 className="text-red-600 group-hover/btn:scale-110 transition" />
                        </button>

                        {/* Image */}
                        <div
                          onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                          className="relative h-48 bg-gray-200 cursor-pointer"
                        >
                          {restaurant.image ? (
                            <img
                              src={`${serverUrl}/uploads/${restaurant.image}`}
                              alt={restaurant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff4d2d]/20 to-[#ff4d2d]/10">
                              <span className="text-6xl">🍽️</span>
                            </div>
                          )}
                          
                          {/* Open/Closed Badge */}
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {restaurant.isOpen ? 'Open' : 'Closed'}
                          </div>
                        </div>

                        {/* Content */}
                        <div 
                          onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                          className="p-4 cursor-pointer"
                        >
                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#ff4d2d] transition">
                            {restaurant.name}
                          </h3>

                          {/* Cuisine */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.cuisine?.slice(0, 3).map((c, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {c}
                              </span>
                            ))}
                          </div>

                          {/* Rating & Time */}
                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <FaStar />
                              <span className="text-gray-700 font-semibold">
                                {restaurant.rating?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-gray-500">
                                ({restaurant.totalReviews || 0})
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600">
                              <FaClock size={12} />
                              <span>{restaurant.deliveryTime || '30-40 mins'}</span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaMapMarkerAlt />
                            <span>{restaurant.address?.city}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 mb-4">No favorite restaurants yet</p>
                    <button
                      onClick={() => navigate('/restaurants')}
                      className="px-6 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Menu Items Tab */}
            {activeTab === 'items' && (
              <div>
                {hasMenuItems ? (
                  <div className="space-y-4">
                    {favorites.menuItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4"
                      >
                        <div className="flex gap-4">
                          {/* Item Image */}
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

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                                
                                {/* Restaurant Info */}
                                {item.restaurant && (
                                  <button
                                    onClick={() => navigate(`/restaurant/${item.restaurant._id}`)}
                                    className="text-xs text-[#ff4d2d] hover:underline mb-2 block"
                                  >
                                    from {item.restaurant.name} →
                                  </button>
                                )}

                                {/* Tags */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    item.isVeg 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                                  </span>

                                  {item.rating > 0 && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <FaStar className="text-yellow-500" size={12} />
                                      <span className="font-semibold">{item.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-[#ff4d2d]">
                                  ₹{item.price}
                                </span>
                                
                                {item.discount > 0 && (
                                  <span className="flex items-center gap-1 text-green-600 text-sm">
                                    <MdLocalOffer size={14} />
                                    {item.discount}% OFF
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => removeMenuItem(item._id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition group"
                                >
                                  <FiTrash2 className="text-red-600 group-hover:scale-110 transition" />
                                </button>
                                
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.isAvailable}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiShoppingBag size={16} />
                                  {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 mb-4">No favorite menu items yet</p>
                    <button
                      onClick={() => navigate('/restaurants')}
                      className="px-6 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
                    >
                      Browse Menu Items
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="text-2xl font-bold text-[#ff4d2d]">
                    {favorites.restaurants?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Restaurants</p>
                </div>
                
                <div>
                  <div className="text-3xl mb-2">🍕</div>
                  <p className="text-2xl font-bold text-[#ff4d2d]">
                    {favorites.menuItems?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Menu Items</p>
                </div>
                
                <div>
                  <div className="text-3xl mb-2">❤️</div>
                  <p className="text-2xl font-bold text-[#ff4d2d]">
                    {(favorites.restaurants?.length || 0) + (favorites.menuItems?.length || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Favorites</p>
                </div>
                
                <div>
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="text-2xl font-bold text-[#ff4d2d]">
                    {favorites.restaurants?.filter(r => r.rating >= 4).length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Top Rated</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Favorites;