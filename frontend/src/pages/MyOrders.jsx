import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await axios.get(
        `${serverUrl}/api/orders/my-orders${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/orders/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <FiClock className="text-yellow-500" />,
      'confirmed': <FiCheck className="text-blue-500" />,
      'preparing': <FiPackage className="text-orange-500" />,
      'ready': <FiCheck className="text-green-500" />,
      'picked-up': <FiTruck className="text-purple-500" />,
      'on-the-way': <FiTruck className="text-purple-500" />,
      'delivered': <FiCheck className="text-green-500" />,
      'cancelled': <FiX className="text-red-500" />
    };
    return icons[status] || <FiPackage />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'preparing': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready': 'bg-green-100 text-green-800 border-green-200',
      'picked-up': 'bg-purple-100 text-purple-800 border-purple-200',
      'on-the-way': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-[#ff4d2d]">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalSpent}</p>
            </div>
          </div>
        )}

        {/* Filters */}
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

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${filter} orders`}
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/order/${order._id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold text-[#ff4d2d]">
                        ₹{order.total}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  {/* Restaurant */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{order.restaurant?.name}</p>
                      <p className="text-sm text-gray-600">{order.restaurant?.phone}</p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {item.name} x{item.quantity}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-[#ff4d2d] font-medium">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FiPackage className="mt-1 flex-shrink-0" />
                    <p>
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
                      {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                    </p>
                  </div>

                  {/* Delivery Boy Info */}
                  {order.deliveryBoy && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <FiTruck className="text-[#ff4d2d]" />
                      <span className="text-gray-600">
                        Delivery Partner: <span className="font-medium text-gray-800">{order.deliveryBoy.name}</span>
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Payment: <span className="font-medium capitalize">{order.paymentMethod}</span>
                      {order.paymentStatus === 'paid' && (
                        <span className="ml-2 text-green-600">✓ Paid</span>
                      )}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${order._id}`);
                      }}
                      className="px-4 py-2 bg-[#ff4d2d] text-white rounded-lg text-sm font-semibold hover:bg-[#e64323] transition"
                    >
                      View Details
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

export default MyOrders;