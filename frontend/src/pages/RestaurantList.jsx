import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FaStar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

function RestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine: '',
    search: '',
    isOpen: true,
    sortBy: 'rating'
  });

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.search) params.append('search', filters.search);
      if (filters.isOpen !== null) params.append('isOpen', filters.isOpen);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await axios.get(
        `${serverUrl}/api/restaurants?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const cuisineTypes = ['Indian', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Desserts'];

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Restaurants Near You
          </h1>
          <p className="text-gray-600">
            Discover delicious food from top-rated restaurants
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
              />
            </div>

            {/* Cuisine Filter */}
            <select
              value={filters.cuisine}
              onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
            >
              <option value="">All Cuisines</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Open/Closed Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isOpen}
                onChange={(e) => setFilters({ ...filters, isOpen: e.target.checked })}
                className="w-4 h-4 text-[#ff4d2d] border-gray-300 rounded focus:ring-[#ff4d2d]"
              />
              <span className="text-sm text-gray-700">Show only open restaurants</span>
            </label>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {restaurants.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">No restaurants found</p>
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {restaurant.image ? (
                      <img
                        src={`${serverUrl}/uploads/${restaurant.image}`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff4d2d]/20 to-[#ff4d2d]/10">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Open/Closed Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#ff4d2d] transition">
                      {restaurant.name}
                    </h3>

                    {/* Cuisine */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {restaurant.cuisine.slice(0, 3).map((c, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Time */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FaStar />
                        <span className="text-gray-700 font-semibold">
                          {restaurant.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({restaurant.totalReviews})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600">
                        <FaClock size={12} />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <FaMapMarkerAlt />
                      <span>{restaurant.address.city}</span>
                    </div>

                    {/* Minimum Order */}
                    {restaurant.minimumOrder > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Min Order: ₹{restaurant.minimumOrder}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantList;