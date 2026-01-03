import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { 
  MdRestaurant, MdFastfood, MdShoppingCart, MdAttachMoney,
  MdTrendingUp, MdStar, MdEdit
} from 'react-icons/md';
import { FiClock, FiPackage } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
    fetchDashboard();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/owner/restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRestaurant(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      // Restaurant doesn't exist yet
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/owner/restaurant/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRestaurant(response.data.data);
        toast.success(`Restaurant is now ${response.data.data.isOpen ? 'open' : 'closed'}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
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

  // No Restaurant Created Yet
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <ToastContainer position="bottom-right" />
        
        <div className="pt-24 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MdRestaurant className="text-[#ff4d2d] w-24 h-24 mx-auto mb-6" />
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Restaurant
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your journey by setting up your restaurant profile. 
              Add your details, menu items, and start receiving orders!
            </p>
            
            <button
              onClick={() => navigate('/owner/restaurant')}
              className="px-8 py-4 bg-[#ff4d2d] text-white rounded-lg font-bold text-lg hover:bg-[#e64323] transition shadow-lg hover:shadow-xl"
            >
              Get Started →
            </button>

            <div className="mt-12 grid grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm font-semibold mb-1">Step 1</p>
                <p className="text-xs text-gray-600">Create restaurant profile</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🍽️</div>
                <p className="text-sm font-semibold mb-1">Step 2</p>
                <p className="text-xs text-gray-600">Add menu items</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🚀</div>
                <p className="text-sm font-semibold mb-1">Step 3</p>
                <p className="text-xs text-gray-600">Start receiving orders</p>
              </div>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {restaurant.name}
            </h1>
            <p className="text-gray-600">Manage your restaurant operations</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleRestaurantStatus}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                restaurant.isOpen
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </button>

            <button
              onClick={() => navigate('/owner/restaurant')}
              className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition flex items-center gap-2"
            >
              <MdEdit />
              Edit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Today's Orders</h3>
                <MdShoppingCart className="text-[#ff4d2d]" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.todayOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeOrders} active
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Today's Revenue</h3>
                <MdAttachMoney className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">₹{stats.todayRevenue}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <MdTrendingUp size={14} />
                Revenue today
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Active Orders</h3>
                <FiPackage className="text-orange-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.activeOrders}</p>
              <p className="text-xs text-gray-500 mt-1">Need attention</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Menu Items</h3>
                <MdFastfood className="text-purple-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalMenuItems}</p>
              <p className="text-xs text-gray-500 mt-1">Total items</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/owner/restaurant')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <MdRestaurant className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Manage Restaurant</h3>
            <p className="text-gray-600 text-sm">Update restaurant details and settings</p>
          </button>

          <button
            onClick={() => navigate('/owner/menu')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <MdFastfood className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Manage Menu</h3>
            <p className="text-gray-600 text-sm">Add, edit, or remove menu items</p>
          </button>

          <button
            onClick={() => navigate('/owner/orders')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <MdShoppingCart className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">View Orders</h3>
            <p className="text-gray-600 text-sm">Manage incoming and active orders</p>
          </button>
        </div>

        {/* Recent Orders */}
        {stats && stats.recentOrders && stats.recentOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
              <button
                onClick={() => navigate('/owner/orders')}
                className="text-[#ff4d2d] font-semibold hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#ff4d2d] hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-[#ff4d2d]" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customer?.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{order.total}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Restaurant Info</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              <div className="flex items-center gap-2">
                <MdStar className="text-yellow-500" size={20} />
                <span className="text-xl font-bold">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-gray-600">({restaurant.totalReviews || 0} reviews)</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Delivery Time</p>
              <div className="flex items-center gap-2">
                <FiClock className="text-gray-600" size={20} />
                <span className="text-xl font-bold">{restaurant.deliveryTime || '30-40 mins'}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Minimum Order</p>
              <p className="text-xl font-bold">₹{restaurant.minimumOrder || 0}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;