const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod, instructions } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.menuItem')
      .populate('restaurant');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify all items are still available
    for (const item of cart.items) {
      if (!item.menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${item.menuItem.name} is no longer available`
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations,
      totalPrice: item.totalPrice
    }));

    // Calculate estimated delivery time
    const restaurantPrepTime = cart.restaurant.preparationTime || 20;
    const deliveryTime = 20; // Average delivery time
    const estimatedDeliveryTime = new Date(Date.now() + (restaurantPrepTime + deliveryTime) * 60000);

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      restaurant: cart.restaurant._id,
      items: orderItems,
      deliveryAddress: {
        ...deliveryAddress,
        instructions
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      subtotal: cart.subtotal,
      tax: cart.tax,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      estimatedDeliveryTime,
      preparationTime: restaurantPrepTime,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }]
    });

    // Clear cart
    cart.items = [];
    cart.restaurant = null;
    cart.deliveryFee = 0;
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name phone address')
      .populate('items.menuItem', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for customer
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name image phone')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('restaurant', 'name image phone address')
      .populate('deliveryBoy', 'name phone deliveryBoyInfo')
      .populate('items.menuItem', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.customer._id.toString() !== req.user.id &&
      order.deliveryBoy?._id.toString() !== req.user.id &&
      order.restaurant.toString() !== req.user.restaurant?.toString() &&
      req.user.role !== 'owner'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if customer owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['picked-up', 'on-the-way', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate order
// @route   PUT /api/orders/:id/rate
// @access  Private (Customer)
exports.rateOrder = async (req, res, next) => {
  try {
    const { foodRating, deliveryRating, comment } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = {
      food: foodRating,
      delivery: deliveryRating,
      comment
    };

    await order.save();

    // Update restaurant rating
    if (foodRating) {
      const restaurant = await Restaurant.findById(order.restaurant);
      const allOrders = await Order.find({
        restaurant: order.restaurant,
        'rating.food': { $exists: true, $ne: null }
      });

      const totalRating = allOrders.reduce((sum, ord) => sum + ord.rating.food, 0);
      restaurant.rating = totalRating / allOrders.length;
      restaurant.totalReviews = allOrders.length;
      await restaurant.save();
    }

    // Update delivery boy rating
    if (deliveryRating && order.deliveryBoy) {
      const deliveryBoy = await User.findById(order.deliveryBoy);
      const allDeliveries = await Order.find({
        deliveryBoy: order.deliveryBoy,
        'rating.delivery': { $exists: true, $ne: null }
      });

      const totalRating = allDeliveries.reduce((sum, ord) => sum + ord.rating.delivery, 0);
      deliveryBoy.deliveryBoyInfo.rating = totalRating / allDeliveries.length;
      await deliveryBoy.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics for customer
// @route   GET /api/orders/statistics
// @access  Private (Customer)
exports.getOrderStatistics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments({ customer: req.user.id });
    const completedOrders = await Order.countDocuments({
      customer: req.user.id,
      status: 'delivered'
    });
    const cancelledOrders = await Order.countDocuments({
      customer: req.user.id,
      status: 'cancelled'
    });

    const orders = await Order.find({ customer: req.user.id, status: 'delivered' });
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        activeOrders: totalOrders - completedOrders - cancelledOrders,
        totalSpent
      }
    });
  } catch (error) {
    next(error);
  }
};