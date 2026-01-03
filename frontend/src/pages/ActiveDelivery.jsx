import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiPackage, FiMapPin, FiPhone, FiCheck } from 'react-icons/fi';
import { MdStore, MdPerson, MdNavigation } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ActiveDelivery() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  const fetchActiveDelivery = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/delivery/active-delivery`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching active delivery:', error);
      if (error.response?.status === 404) {
        // No active delivery
        setOrder(null);
      } else {
        toast.error('Failed to load delivery');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/delivery/orders/${order._id}/${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Order marked as ${newStatus}!`);
        
        if (newStatus === 'delivered') {
          setTimeout(() => {
            navigate('/delivery/dashboard');
          }, 2000);
        } else {
          fetchActiveDelivery();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
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

  const getGoogleMapsLink = (address) => {
    const query = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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

  // No Active Delivery
  if (!order) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <ToastContainer position="bottom-right" />
        
        <div className="pt-24 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No active delivery</h3>
            <p className="text-gray-600 mb-6">
              Accept an order to start delivering
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
        </div>
      </div>
    );
  }

  const canMarkOnTheWay = order.status === 'picked-up';
  const canMarkDelivered = order.status === 'on-the-way';

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Active Delivery</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Current Status</p>
              <p className="text-2xl font-bold uppercase">{order.status.replace('-', ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Delivery Fee</p>
              <p className="text-3xl font-bold">₹{order.deliveryFee}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pickup Location */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdStore className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup from</p>
                  <p className="font-bold text-lg">{order.restaurant?.name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    {order.restaurant?.address?.street}, {order.restaurant?.address?.city}, 
                    {order.restaurant?.address?.state} - {order.restaurant?.address?.zipCode}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone className="text-gray-400" />
                  <p className="text-gray-700">{order.restaurant?.phone}</p>
                </div>
              </div>

              <a
                href={getGoogleMapsLink(order.restaurant?.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <MdNavigation />
                Navigate to Restaurant
              </a>
            </div>

            {/* Delivery Location */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MdPerson className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deliver to</p>
                  <p className="font-bold text-lg">{order.customer?.name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
                    {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone className="text-gray-400" />
                  <p className="text-gray-700">{order.customer?.phone}</p>
                </div>
              </div>

              {order.deliveryAddress.instructions && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Delivery Instructions:</p>
                  <p className="text-sm text-yellow-800">{order.deliveryAddress.instructions}</p>
                </div>
              )}

              <a
                href={getGoogleMapsLink(order.deliveryAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                <MdNavigation />
                Navigate to Customer
              </a>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Order Items ({order.items.length})</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold">₹{item.totalPrice}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#ff4d2d]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Update Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Update Status</h3>
              
              <div className="space-y-3">
                {canMarkOnTheWay && (
                  <button
                    onClick={() => updateStatus('on-the-way')}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FiPackage />
                        <span>On the Way</span>
                      </>
                    )}
                  </button>
                )}

                {canMarkDelivered && (
                  <button
                    onClick={() => updateStatus('delivered')}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        <span>Mark as Delivered</span>
                      </>
                    )}
                  </button>
                )}

                {!canMarkOnTheWay && !canMarkDelivered && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-semibold capitalize">{order.status.replace('-', ' ')}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Payment Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : 'Collect Cash'}
                  </span>
                </div>
                {order.paymentStatus !== 'paid' && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-semibold text-orange-900">
                      Collect: ₹{order.total}
                    </p>
                    <p className="text-xs text-orange-700 mt-1">Cash on Delivery</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Timeline</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Order Placed</p>
                  <p className="font-semibold">{formatDate(order.createdAt)}</p>
                </div>
                {order.statusHistory?.map((status, index) => (
                  <div key={index}>
                    <p className="text-gray-600 capitalize">{status.status.replace('-', ' ')}</p>
                    <p className="font-semibold">{formatDate(status.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveDelivery;