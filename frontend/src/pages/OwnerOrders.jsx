import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiClock, FiCheck } from 'react-icons/fi';
import { MdShoppingCart } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OwnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' }
  ];

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await axios.get(
        `${serverUrl}/api/owner/orders${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!loading) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/owner/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Order ${newStatus}!`);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready'
    };
    return statusFlow[currentStatus];
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders Management</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} 
            {filter !== 'all' && ` - ${filter}`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusOptions.map((option) => (
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
            <MdShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600">
              Orders will appear here when customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const canUpdateStatus = nextStatus && ['pending', 'confirmed', 'preparing'].includes(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl">Order #{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <p className="text-2xl font-bold text-[#ff4d2d]">₹{order.total}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold">{order.customer?.name}</p>
                          <p className="text-sm text-gray-600">{order.customer?.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Payment</p>
                          <p className="font-semibold capitalize">{order.paymentMethod}</p>
                          <span className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-semibold">₹{item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Delivery Address:</p>
                      <p className="text-sm text-blue-800">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
                        {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                      </p>
                      {order.deliveryAddress.instructions && (
                        <p className="text-xs text-blue-700 mt-1">
                          Note: {order.deliveryAddress.instructions}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="flex-1 px-4 py-2 border-2 border-[#ff4d2d] text-[#ff4d2d] rounded-lg font-semibold hover:bg-[#ff4d2d]/5 transition"
                      >
                        View Details
                      </button>
                      
                      {canUpdateStatus && (
                        <button
                          onClick={() => updateOrderStatus(order._id, nextStatus)}
                          disabled={updatingOrder === order._id}
                          className="flex-1 px-4 py-2 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {updatingOrder === order._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck />
                              <span>Mark as {nextStatus}</span>
                            </>
                          )}
                        </button>
                      )}

                      {order.status === 'ready' && !order.deliveryBoy && (
                        <div className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium text-center">
                          <FiClock className="inline mr-2" />
                          Waiting for delivery partner
                        </div>
                      )}
                    </div>

                    {/* Delivery Boy Info */}
                    {order.deliveryBoy && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-1">Delivery Partner:</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-purple-800">{order.deliveryBoy.name}</p>
                            <p className="text-xs text-purple-700">{order.deliveryBoy.phone}</p>
                          </div>
                          {order.deliveryBoy.vehicle && (
                            <div className="text-xs text-purple-700">
                              {order.deliveryBoy.vehicle.type} - {order.deliveryBoy.vehicle.number}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerOrders;