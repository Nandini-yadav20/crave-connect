const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get available orders for delivery
// @route   GET /api/delivery/available-orders
// @access  Private (Delivery)
exports.getAvailableOrders = async (req, res, next) => {
  try {
    // Get orders that are ready for pickup and don't have a delivery boy assigned
    const orders = await Order.find({
      status: 'ready',
      deliveryBoy: null
    })
      .populate('restaurant', 'name phone address')
      .populate('customer', 'name phone address')
      .sort({ createdAt: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept order for delivery
// @route   PUT /api/delivery/accept-order/:orderId
// @access  Private (Delivery)
exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for pickup'
      });
    }

    if (order.deliveryBoy) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another delivery boy'
      });
    }

    // Check if delivery boy is available
    const deliveryBoy = await User.findById(req.user.id);
    if (!deliveryBoy.deliveryBoyInfo.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'You are currently unavailable'
      });
    }

    order.deliveryBoy = req.user.id;
    order.status = 'picked-up';
    order.statusHistory.push({
      status: 'picked-up',
      timestamp: new Date(),
      note: 'Order picked up by delivery boy'
    });

    await order.save();

    // Mark delivery boy as unavailable
    deliveryBoy.deliveryBoyInfo.isAvailable = false;
    await deliveryBoy.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name phone address')
      .populate('customer', 'name phone address');

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my delivery orders
// @route   GET /api/delivery/my-orders
// @access  Private (Delivery)
exports.getMyDeliveryOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { deliveryBoy: req.user.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name phone address')
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current active delivery
// @route   GET /api/delivery/active-delivery
// @access  Private (Delivery)
exports.getActiveDelivery = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      deliveryBoy: req.user.id,
      status: { $in: ['picked-up', 'on-the-way'] }
    })
      .populate('restaurant', 'name phone address')
      .populate('customer', 'name phone address');

    if (!order) {
      return res.status(200).json({
        success: true,
        message: 'No active delivery',
        data: null
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

// @desc    Update delivery location
// @route   PUT /api/delivery/update-location
// @access  Private (Delivery)
exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const user = await User.findById(req.user.id);

    user.deliveryBoyInfo.currentLocation = {
      latitude,
      longitude
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: user.deliveryBoyInfo.currentLocation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (on the way)
// @route   PUT /api/delivery/orders/:orderId/on-the-way
// @access  Private (Delivery)
exports.markOnTheWay = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryBoy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    if (order.status !== 'picked-up') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in picked-up status'
      });
    }

    order.status = 'on-the-way';
    order.statusHistory.push({
      status: 'on-the-way',
      timestamp: new Date(),
      note: 'Order is on the way to customer'
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as delivered
// @route   PUT /api/delivery/orders/:orderId/delivered
// @access  Private (Delivery)
exports.markDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryBoy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    if (order.status !== 'on-the-way') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in on-the-way status'
      });
    }

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Order delivered successfully'
    });

    // Update payment status if cash on delivery
    if (order.paymentMethod === 'cash') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Update delivery boy stats
    const deliveryBoy = await User.findById(req.user.id);
    deliveryBoy.deliveryBoyInfo.totalDeliveries += 1;
    deliveryBoy.deliveryBoyInfo.earnings += order.deliveryFee;
    deliveryBoy.deliveryBoyInfo.isAvailable = true;

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability status
// @route   PUT /api/delivery/toggle-availability
// @access  Private (Delivery)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if there's an active delivery
    const activeDelivery = await Order.findOne({
      deliveryBoy: req.user.id,
      status: { $in: ['picked-up', 'on-the-way'] }
    });

    if (activeDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change availability while on active delivery'
      });
    }

    user.deliveryBoyInfo.isAvailable = !user.deliveryBoyInfo.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `You are now ${user.deliveryBoyInfo.isAvailable ? 'available' : 'unavailable'}`,
      data: {
        isAvailable: user.deliveryBoyInfo.isAvailable
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery boy dashboard statistics
// @route   GET /api/delivery/dashboard
// @access  Private (Delivery)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const deliveryBoy = await User.findById(req.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's deliveries
    const todayDeliveries = await Order.countDocuments({
      deliveryBoy: req.user.id,
      status: 'delivered',
      actualDeliveryTime: { $gte: today }
    });

    // Today's earnings
    const todayEarnings = await Order.aggregate([
      {
        $match: {
          deliveryBoy: req.user.id,
          status: 'delivered',
          actualDeliveryTime: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$deliveryFee' }
        }
      }
    ]);

    // Active delivery
    const activeDelivery = await Order.findOne({
      deliveryBoy: req.user.id,
      status: { $in: ['picked-up', 'on-the-way'] }
    })
      .populate('restaurant', 'name address')
      .populate('customer', 'name address');

    // Recent deliveries
    const recentDeliveries = await Order.find({
      deliveryBoy: req.user.id,
      status: 'delivered'
    })
      .populate('restaurant', 'name')
      .populate('customer', 'name')
      .sort({ actualDeliveryTime: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        todayDeliveries,
        todayEarnings: todayEarnings[0]?.total || 0,
        totalDeliveries: deliveryBoy.deliveryBoyInfo.totalDeliveries,
        totalEarnings: deliveryBoy.deliveryBoyInfo.earnings,
        rating: deliveryBoy.deliveryBoyInfo.rating,
        isAvailable: deliveryBoy.deliveryBoyInfo.isAvailable,
        activeDelivery,
        recentDeliveries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery boy profile
// @route   PUT /api/delivery/profile
// @access  Private (Delivery)
exports.updateProfile = async (req, res, next) => {
  try {
    const { vehicleType, vehicleNumber, licenseNumber } = req.body;

    const user = await User.findById(req.user.id);

    if (vehicleType) user.deliveryBoyInfo.vehicleType = vehicleType;
    if (vehicleNumber) user.deliveryBoyInfo.vehicleNumber = vehicleNumber;
    if (licenseNumber) user.deliveryBoyInfo.licenseNumber = licenseNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};