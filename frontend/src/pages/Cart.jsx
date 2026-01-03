import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { MdLocalOffer } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/cart/update/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${serverUrl}/api/cart/remove/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear all items from cart?')) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${serverUrl}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/checkout');
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

  // Empty Cart State
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fff9f6]">
        <Nav />
        <ToastContainer position="bottom-right" />
        
        <div className="pt-24 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-[#ff4d2d]" size={48} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Your cart is empty
            </h2>
            
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet
            </p>
            
            <button
              onClick={() => navigate('/restaurants')}
              className="px-8 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64323] transition"
            >
              Browse Restaurants
            </button>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Cart
            </h1>
            <p className="text-gray-600">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            >
              <FiTrash2 />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Restaurant Info */}
            {cart.restaurant && (
              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-[#ff4d2d]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ordering from</p>
                    <h3 className="font-bold text-lg">{cart.restaurant.name}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.menuItem?.image ? (
                      <img
                        src={`${serverUrl}/uploads/${item.menuItem.image}`}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {item.menuItem?.name || 'Item'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} each
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={updating}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition disabled:opacity-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {/* Customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Customizations:</p>
                        {item.customizations.map((custom, index) => (
                          <span
                            key={index}
                            className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2"
                          >
                            {custom.name}: {custom.selectedOption} 
                            {custom.price > 0 && ` (+₹${custom.price})`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-[#ff4d2d]/10 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiMinus size={16} />
                        </button>
                        
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updating}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-[#ff4d2d]">
                          ₹{item.totalPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <MdLocalOffer className="text-[#ff4d2d]" />
                Bill Summary
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Item Total</span>
                  <span>₹{cart.subtotal?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₹{cart.deliveryFee?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span>₹{cart.tax?.toFixed(2)}</span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{cart.discount?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-[#ff4d2d]">
                    ₹{cart.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                disabled={updating}
                className="w-full bg-[#ff4d2d] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#e64323] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  You can review your order before payment
                </p>
              </div>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate(`/restaurant/${cart.restaurant._id}`)}
                className="w-full mt-3 border-2 border-[#ff4d2d] text-[#ff4d2d] py-3 rounded-lg font-semibold hover:bg-[#ff4d2d]/5 transition"
              >
                Add More Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;