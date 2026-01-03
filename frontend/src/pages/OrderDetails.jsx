import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { 
  FiPackage, FiClock, FiCheck, FiX, FiTruck, FiMapPin, 
  FiPhone, FiStar, FiAlertCircle 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState({
    food: 0,
    delivery: 0,
    comment: ''
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${serverUrl}/api/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/orders/${id}/cancel`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const submitRating = async () => {
    if (rating.food === 0 && rating.delivery === 0) {
      toast.error('Please provide at least one rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/orders/${id}/rate`,
        {
          foodRating: rating.food,
          deliveryRating: rating.delivery,
          comment: rating.comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setShowRatingModal(false);
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: FiPackage },
      { status: 'confirmed', label: 'Confirmed', icon: FiCheck },
      { status: 'preparing', label: 'Preparing', icon: FiClock },
      { status: 'ready', label: 'Ready', icon: FiCheck },
      { status: 'picked-up', label: 'Picked Up', icon: FiTruck },
      { status: 'on-the-way', label: 'On the Way', icon: FiTruck },
      { status: 'delivered', label: 'Delivered', icon: FiCheck }
    ];

    if (order?.status === 'cancelled') {
      return [
        { status: 'pending', label: 'Order Placed', icon: FiPackage },
        { status: 'cancelled', label: 'Cancelled', icon: FiX }
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.status === order?.status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <div className="text-center py-20">
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canRate = order.status === 'delivered' && !order.rating?.food;
  const currentStep = getCurrentStepIndex();
  const steps = getStatusSteps();

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-[#ff4d2d] hover:underline mb-4"
          >
            ← Back to Orders
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">{formatDate(order.createdAt)}</p>
            </div>
            
            <div className="flex gap-3">
              {canCancel && (
                <button
                  onClick={cancelOrder}
                  className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  Cancel Order
                </button>
              )}
              {canRate && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition flex items-center gap-2"
                >
                  <FiStar />
                  Rate Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Order Status</h2>
              
              <div className="relative">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCancelled = order.status === 'cancelled' && step.status === 'cancelled';
                  
                  return (
                    <div key={step.status} className="flex gap-4 mb-8 last:mb-0">
                      {/* Icon */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCancelled 
                            ? 'bg-red-100 border-2 border-red-500' 
                            : isCompleted 
                            ? 'bg-[#ff4d2d] border-2 border-[#ff4d2d]' 
                            : 'bg-gray-100 border-2 border-gray-300'
                        }`}>
                          <Icon className={
                            isCancelled 
                              ? 'text-red-600' 
                              : isCompleted 
                              ? 'text-white' 
                              : 'text-gray-400'
                          } size={20} />
                        </div>
                        
                        {/* Line */}
                        {index < steps.length - 1 && (
                          <div className={`w-0.5 h-16 ${
                            index < currentStep ? 'bg-[#ff4d2d]' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <p className={`font-semibold ${
                          isCancelled 
                            ? 'text-red-600' 
                            : isCompleted 
                            ? 'text-gray-800' 
                            : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        {isCompleted && order.statusHistory && (
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(
                              order.statusHistory.find(h => h.status === step.status)?.timestamp
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Delivery Time */}
              {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <FiClock className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-sm text-blue-700">{formatDate(order.estimatedDeliveryTime)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-1">
                          {item.customizations.map((custom, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1">
                              {custom.name}: {custom.selectedOption}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₹{order.tax}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#ff4d2d]">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Rating Display */}
            {order.rating?.food && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Your Review</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Food Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={star <= order.rating.food ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  {order.rating.delivery && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={star <= order.rating.delivery ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {order.rating.comment && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Comment</p>
                      <p className="text-gray-800">{order.rating.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Restaurant Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Restaurant</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff4d2d]/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <p className="font-semibold">{order.restaurant?.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FiPhone size={14} />
                    {order.restaurant?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiMapPin className="text-[#ff4d2d]" />
                Delivery Address
              </h3>
              <p className="text-gray-700">
                {order.deliveryAddress.street}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                {order.deliveryAddress.zipCode}
              </p>
              {order.deliveryAddress.instructions && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Instructions:</p>
                  <p className="text-sm text-gray-800">{order.deliveryAddress.instructions}</p>
                </div>
              )}
            </div>

            {/* Delivery Boy Info */}
            {order.deliveryBoy && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiTruck className="text-[#ff4d2d]" />
                  Delivery Partner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-purple-600">
                      {order.deliveryBoy.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{order.deliveryBoy.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FiPhone size={14} />
                      {order.deliveryBoy.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Payment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-6">Rate Your Order</h3>
            
            <div className="space-y-6">
              {/* Food Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How was the food?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating({ ...rating, food: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <FiStar
                        size={32}
                        className={star <= rating.food ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Rating */}
              {order.deliveryBoy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How was the delivery?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating({ ...rating, delivery: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <FiStar
                          size={32}
                          className={star <= rating.delivery ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={rating.comment}
                  onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  className="flex-1 px-4 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;