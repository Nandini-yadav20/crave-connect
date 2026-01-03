import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiMapPin, FiPhone } from 'react-icons/fi';
import { MdStore, MdPerson } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AvailableOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchAvailableOrders();
    // Poll for new orders every 15 seconds
    const interval = setInterval(fetchAvailableOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/delivery/available-orders`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      if (!loading) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    setAccepting(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/delivery/accept-order/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Order accepted! Redirecting to active delivery...');
        setTimeout(() => {
          navigate('/delivery/active');
        }, 1500);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
      setAccepting(null);
    }
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

  const calculateDistance = (order) => {
    // Simplified distance calculation - in real app, use Google Maps API
    return '2.5 km'; // Placeholder
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Orders</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} ready for pickup
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No available orders</h3>
            <p className="text-gray-600 mb-6">
              New orders will appear here when they're ready for pickup
            </p>
            <button
              onClick={() => navigate('/delivery/dashboard')}
              className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
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
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          READY FOR PICKUP
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-600">Delivery Fee</p>
                      <p className="text-3xl font-bold text-[#ff4d2d]">₹{order.deliveryFee}</p>
                      <p className="text-xs text-gray-500">{calculateDistance(order)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Restaurant Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MdStore className="text-blue-600" size={20} />
                        <p className="font-semibold text-blue-900">Pickup from</p>
                      </div>
                      <p className="font-bold text-gray-800 mb-1">{order.restaurant?.name}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        <FiMapPin className="inline mr-1" size={12} />
                        {order.restaurant?.address?.street}, {order.restaurant?.address?.city}
                      </p>
                      <p className="text-sm text-gray-600">
                        <FiPhone className="inline mr-1" size={12} />
                        {order.restaurant?.phone}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MdPerson className="text-orange-600" size={20} />
                        <p className="font-semibold text-orange-900">Deliver to</p>
                      </div>
                      <p className="font-bold text-gray-800 mb-1">{order.customer?.name}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        <FiMapPin className="inline mr-1" size={12} />
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </p>
                      <p className="text-sm text-gray-600">
                        <FiPhone className="inline mr-1" size={12} />
                        {order.customer?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-2">Order Items ({order.items.length})</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} x{item.quantity}</span>
                          <span className="font-semibold">₹{item.totalPrice}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-[#ff4d2d] font-medium">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                      <span>Total Order Value</span>
                      <span className="text-[#ff4d2d]">₹{order.total}</span>
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  {order.deliveryAddress.instructions && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Delivery Instructions:</p>
                      <p className="text-sm text-yellow-800">{order.deliveryAddress.instructions}</p>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="mb-4 flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-900 font-medium">Payment Method</p>
                      <p className="text-sm text-purple-700 capitalize">{order.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-900 font-medium">Payment Status</p>
                      <span className={`text-sm font-semibold ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid Online' : 'Collect ₹' + order.total}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptOrder(order._id)}
                      disabled={accepting === order._id}
                      className="flex-1 px-6 py-4 bg-[#ff4d2d] text-white rounded-lg font-bold text-lg hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {accepting === order._id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <FiPackage size={20} />
                          <span>Accept Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchAvailableOrders}
              className="px-6 py-3 bg-white border-2 border-[#ff4d2d] text-[#ff4d2d] rounded-lg font-semibold hover:bg-[#ff4d2d]/5 transition"
            >
              🔄 Refresh Orders
            </button>
            <p className="text-xs text-gray-500 mt-2">Auto-refreshing every 15 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailableOrders;