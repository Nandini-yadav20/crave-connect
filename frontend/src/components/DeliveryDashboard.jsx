import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiDollarSign, FiTruck, FiStar } from 'react-icons/fi';
import { MdTrendingUp } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeliveryDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/delivery/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
        setAvailability(response.data.data.isAvailable);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (stats?.activeDelivery) {
      toast.error('Cannot change availability during active delivery');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/delivery/toggle-availability`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAvailability(response.data.data.isAvailable);
        toast.success(
          response.data.data.isAvailable 
            ? 'You are now available for deliveries' 
            : 'You are now offline'
        );
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        {/* Header with Availability Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Delivery Dashboard</h1>
            <p className="text-gray-600">Manage your deliveries and earnings</p>
          </div>

          <button
            onClick={toggleAvailability}
            disabled={updating || stats?.activeDelivery}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              availability
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className={`w-3 h-3 rounded-full ${availability ? 'bg-green-500' : 'bg-gray-500'}`} />
            {updating ? 'Updating...' : availability ? 'Available' : 'Offline'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Today's Deliveries</h3>
                <FiPackage className="text-[#ff4d2d]" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.todayDeliveries}</p>
              <p className="text-xs text-gray-500 mt-1">Completed today</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Today's Earnings</h3>
                <FiDollarSign className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">₹{stats.todayEarnings}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <MdTrendingUp size={14} />
                Earnings today
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Total Deliveries</h3>
                <FiTruck className="text-purple-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalDeliveries}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-600 font-medium">Total Earnings</h3>
                <FiDollarSign className="text-orange-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">₹{stats.totalEarnings}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/delivery/available')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <FiPackage className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Available Orders</h3>
            <p className="text-gray-600 text-sm">View orders ready for pickup</p>
            {stats && stats.availableOrders > 0 && (
              <span className="inline-block mt-3 px-3 py-1 bg-[#ff4d2d] text-white rounded-full text-sm font-semibold">
                {stats.availableOrders} orders available
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/delivery/active')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <FiTruck className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Active Delivery</h3>
            <p className="text-gray-600 text-sm">Track your current delivery</p>
            {stats?.activeDelivery && (
              <span className="inline-block mt-3 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold animate-pulse">
                Delivery in progress
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/delivery/history')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-left group"
          >
            <FiStar className="text-[#ff4d2d] mb-4 group-hover:scale-110 transition" size={40} />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Delivery History</h3>
            <p className="text-gray-600 text-sm">View past deliveries and ratings</p>
          </button>
        </div>

        {/* Active Delivery Card */}
        {stats?.activeDelivery && (
          <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-xl shadow-lg p-6 mb-8 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiTruck size={24} />
              Active Delivery
            </h3>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Order Number</p>
                  <p className="font-bold text-lg">#{stats.activeDelivery.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Delivery Fee</p>
                  <p className="font-bold text-lg">₹{stats.activeDelivery.deliveryFee}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Restaurant</p>
                  <p className="font-semibold">{stats.activeDelivery.restaurant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Customer</p>
                  <p className="font-semibold">{stats.activeDelivery.customer?.name}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/delivery/active')}
              className="w-full bg-white text-[#ff4d2d] py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              View Delivery Details →
            </button>
          </div>
        )}

        {/* Recent Deliveries */}
        {stats?.recentDeliveries && stats.recentDeliveries.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Deliveries</h2>
              <button
                onClick={() => navigate('/delivery/history')}
                className="text-[#ff4d2d] font-semibold hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {stats.recentDeliveries.map((delivery) => (
                <div
                  key={delivery._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#ff4d2d] hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-[#ff4d2d]" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Order #{delivery.orderNumber}</p>
                      <p className="text-sm text-gray-600">{formatDate(delivery.createdAt)}</p>
                      {delivery.rating?.delivery && (
                        <div className="flex items-center gap-1 mt-1">
                          <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-sm font-semibold">{delivery.rating.delivery}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{delivery.deliveryFee}</p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Stats */}
        {stats && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Performance</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <FiStar className="text-yellow-500" size={20} />
                  <span className="text-2xl font-bold">{stats.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-600">({stats.totalRatings || 0} ratings)</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Average Earnings/Delivery</p>
                <p className="text-2xl font-bold">
                  ₹{stats.totalDeliveries > 0 ? (stats.totalEarnings / stats.totalDeliveries).toFixed(2) : '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;