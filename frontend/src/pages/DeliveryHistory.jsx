import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiStar, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeliveryHistory() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDeliveryHistory();
  }, [filter]);

  const fetchDeliveryHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/delivery/my-orders?status=delivered`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        let filteredDeliveries = response.data.data;
        
        // Apply date filter
        if (filter !== 'all') {
          const now = new Date();
          const filterDate = new Date();
          
          if (filter === 'today') {
            filterDate.setHours(0, 0, 0, 0);
          } else if (filter === 'week') {
            filterDate.setDate(now.getDate() - 7);
          } else if (filter === 'month') {
            filterDate.setMonth(now.getMonth() - 1);
          }
          
          filteredDeliveries = filteredDeliveries.filter(
            d => new Date(d.updatedAt) >= filterDate
          );
        }
        
        setDeliveries(filteredDeliveries);
        
        // Calculate stats
        const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
        const avgRating = filteredDeliveries
          .filter(d => d.rating?.delivery)
          .reduce((sum, d, _, arr) => sum + d.rating.delivery / arr.length, 0);
        
        setStats({
          total: filteredDeliveries.length,
          earnings: totalEarnings,
          avgRating: avgRating || 0
        });
      }
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      toast.error('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Delivery History</h1>
          <p className="text-gray-600">
            Your past deliveries and earnings
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="text-[#ff4d2d]" size={20} />
                <p className="text-sm text-gray-600">Deliveries</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="text-green-600" size={20} />
                <p className="text-sm text-gray-600">Earnings</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">₹{stats.earnings}</p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <FiStar className="text-yellow-500" size={20} />
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === option.value
                    ? 'bg-[#ff4d2d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No deliveries found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't completed any deliveries yet" 
                : `No deliveries in the selected time period`}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/delivery/available')}
                className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
              >
                View Available Orders
              </button>
              <button
                onClick={() => navigate('/delivery/dashboard')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  {/* Delivery Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">Order #{delivery.orderNumber}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          DELIVERED
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(delivery.updatedAt)}</p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-600">Earned</p>
                      <p className="text-3xl font-bold text-green-600">₹{delivery.deliveryFee}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Restaurant */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MdStore className="text-blue-600" size={18} />
                        <p className="text-sm font-semibold text-blue-900">From</p>
                      </div>
                      <p className="font-bold text-gray-800">{delivery.restaurant?.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {delivery.restaurant?.address?.city}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiMapPin className="text-orange-600" size={18} />
                        <p className="text-sm font-semibold text-orange-900">To</p>
                      </div>
                      <p className="font-bold text-gray-800">{delivery.customer?.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {delivery.deliveryAddress.city}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold ml-1">{delivery.items.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Value:</span>
                      <span className="font-semibold ml-1">₹{delivery.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-semibold ml-1 capitalize">{delivery.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {delivery.rating?.delivery ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-yellow-900 mb-1">Customer Rating</p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={star <= delivery.rating.delivery ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                size={18}
                              />
                            ))}
                            <span className="font-bold text-yellow-900">{delivery.rating.delivery.toFixed(1)}</span>
                          </div>
                        </div>
                        {delivery.rating.comment && (
                          <div className="text-right max-w-xs">
                            <p className="text-xs text-yellow-800 italic">"{delivery.rating.comment}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-500">No rating received yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {deliveries.length > 0 && stats && (
          <div className="mt-8 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Summary ({filter})</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-white/80 mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">₹{stats.earnings}</p>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-1">Avg per Delivery</p>
                <p className="text-3xl font-bold">
                  ₹{stats.total > 0 ? (stats.earnings / stats.total).toFixed(0) : 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryHistory;