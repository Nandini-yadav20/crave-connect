import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiMapPin, FiCreditCard, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  });
  
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchCart();
    getCurrentLocation();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (response.data.data.items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryAddress(prev => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!deliveryAddress.street.trim()) {
      toast.error('Please enter street address');
      return false;
    }
    if (!deliveryAddress.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!deliveryAddress.state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    if (!deliveryAddress.zipCode.trim()) {
      toast.error('Please enter ZIP code');
      return false;
    }
    if (deliveryAddress.zipCode.length !== 6) {
      toast.error('ZIP code must be 6 digits');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${serverUrl}/api/orders`,
        {
          deliveryAddress: {
            ...deliveryAddress,
            instructions
          },
          paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Order placed successfully!');
        setTimeout(() => {
          navigate(`/order/${response.data.data._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
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

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <Nav />
      <ToastContainer position="bottom-right" />
      
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center">
                  <FiMapPin className="text-[#ff4d2d]" size={20} />
                </div>
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={deliveryAddress.street}
                    onChange={handleAddressChange}
                    placeholder="House/Flat No., Building Name, Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Enter state"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                    placeholder="6-digit ZIP code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="E.g., Ring the doorbell, Leave at door, etc."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center">
                  <FiCreditCard className="text-[#ff4d2d]" size={20} />
                </div>
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
                  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                  { value: 'upi', label: 'UPI', icon: '📱' },
                  { value: 'wallet', label: 'Wallet', icon: '👛' }
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === method.value
                        ? 'border-[#ff4d2d] bg-[#ff4d2d]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#ff4d2d] focus:ring-[#ff4d2d]"
                    />
                  </label>
                ))}
              </div>

              {paymentMethod !== 'cash' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 Online payment integration coming soon. Currently only Cash on Delivery is available.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-[#ff4d2d]" />
                Order Summary
              </h3>

              {/* Restaurant */}
              {cart && cart.restaurant && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Ordering from</p>
                  <p className="font-semibold">{cart.restaurant.name}</p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart && cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.menuItem?.name || 'Item'}
                        <span className="text-gray-500 ml-1">x{item.quantity}</span>
                      </p>
                    </div>
                    <p className="font-semibold">₹{item.totalPrice}</p>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 mb-4 pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Item Total</span>
                  <span>₹{cart?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₹{cart?.deliveryFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax (5%)</span>
                  <span>₹{cart?.tax?.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">To Pay</span>
                  <span className="font-bold text-2xl text-[#ff4d2d]">
                    ₹{cart?.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-[#ff4d2d] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <FiCheck size={20} />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;