const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create restaurant
// @route   POST /api/owner/restaurant
// @access  Private (Owner)
exports.createRestaurant = async (req, res, next) => {
  try {
    // Check if owner already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'You already have a restaurant'
      });
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user.id
    });

    // Update user's restaurant reference
    await User.findByIdAndUpdate(req.user.id, { restaurant: restaurant._id });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's restaurant
// @route   GET /api/owner/restaurant
// @access  Private (Owner)
exports.getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id })
      .populate('menuItems');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/owner/restaurant
// @access  Private (Owner)
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(restaurant._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle restaurant open/close status
// @route   PUT /api/owner/restaurant/toggle-status
// @access  Private (Owner)
exports.toggleRestaurantStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add menu item
// @route   POST /api/owner/menu-items
// @access  Private (Owner)
exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found. Please create a restaurant first.'
      });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurant: restaurant._id
    });

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menu items for owner's restaurant
// @route   GET /api/owner/menu-items
// @access  Private (Owner)
exports.getMyMenuItems = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { category, isAvailable } = req.query;
    const query = { restaurant: restaurant._id };

    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/owner/menu-items/:id
// @access  Private (Owner)
exports.updateMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if menu item belongs to owner's restaurant
    if (menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/owner/menu-items/:id
// @access  Private (Owner)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability
// @route   PUT /api/owner/menu-items/:id/toggle-availability
// @access  Private (Owner)
exports.toggleMenuItemAvailability = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant orders
// @route   GET /api/owner/orders
// @access  Private (Owner)
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { restaurant: restaurant._id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone address')
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

// @desc    Update order status
// @route   PUT /api/owner/orders/:id/status
// @access  Private (Owner)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note
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

// @desc    Get restaurant dashboard statistics
// @route   GET /api/owner/dashboard
// @access  Private (Owner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await Order.countDocuments({
      restaurant: restaurant._id,
      createdAt: { $gte: today }
    });

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          createdAt: { $gte: today },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Total orders
    const totalOrders = await Order.countDocuments({
      restaurant: restaurant._id
    });

    // Active orders
    const activeOrders = await Order.countDocuments({
      restaurant: restaurant._id,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'on-the-way'] }
    });

    // Total menu items
    const totalMenuItems = await MenuItem.countDocuments({
      restaurant: restaurant._id
    });

    // Recent orders
    const recentOrders = await Order.find({
      restaurant: restaurant._id
    })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalOrders,
        activeOrders,
        totalMenuItems,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};