const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private (Customer)
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('restaurant', 'name image')
      .populate('items.menuItem', 'name image price');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private (Customer)
exports.addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity, customizations } = req.body;

    // Get menu item
    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (!menuItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This item is currently unavailable'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        restaurant: menuItem.restaurant._id,
        items: []
      });
    }

    // Check if cart has items from different restaurant
    if (cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant._id.toString() && cart.items.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only order from one restaurant at a time. Please clear your cart first.'
      });
    }

    // Calculate item price with customizations
    let itemPrice = menuItem.price;
    let customizationTotal = 0;

    if (customizations && customizations.length > 0) {
      customizations.forEach(custom => {
        customizationTotal += custom.price || 0;
      });
    }

    const totalPrice = (itemPrice + customizationTotal) * quantity;

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice = 
        (itemPrice + customizationTotal) * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        menuItem: menuItemId,
        quantity,
        customizations: customizations || [],
        price: itemPrice,
        totalPrice
      });
    }

    cart.restaurant = menuItem.restaurant._id;

    // Calculate delivery fee based on distance (simplified)
    cart.deliveryFee = 50; // Base delivery fee

    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('restaurant', 'name image')
      .populate('items.menuItem', 'name image price');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private (Customer)
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Recalculate total price
    const basePrice = item.price;
    const customizationTotal = item.customizations.reduce((sum, custom) => sum + (custom.price || 0), 0);
    
    item.quantity = quantity;
    item.totalPrice = (basePrice + customizationTotal) * quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name image')
      .populate('items.menuItem', 'name image price');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private (Customer)
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // If cart is empty, clear restaurant
    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.deliveryFee = 0;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name image')
      .populate('items.menuItem', 'name image price');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private (Customer)
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.restaurant = null;
    cart.deliveryFee = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};