const Favorite = require('../models/Favorite');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private (Customer)
exports.getFavorites = async (req, res, next) => {
  try {
    let favorites = await Favorite.findOne({ user: req.user.id })
      .populate('restaurants', 'name image cuisine rating')
      .populate('menuItems', 'name image price restaurant');

    if (!favorites) {
      favorites = await Favorite.create({
        user: req.user.id,
        restaurants: [],
        menuItems: []
      });
    }

    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add restaurant to favorites
// @route   POST /api/favorites/restaurant/:restaurantId
// @access  Private (Customer)
exports.addRestaurantToFavorites = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    let favorites = await Favorite.findOne({ user: req.user.id });

    if (!favorites) {
      favorites = await Favorite.create({
        user: req.user.id,
        restaurants: [restaurantId],
        menuItems: []
      });
    } else {
      // Check if already in favorites
      if (favorites.restaurants.includes(restaurantId)) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant already in favorites'
        });
      }

      favorites.restaurants.push(restaurantId);
      await favorites.save();
    }

    favorites = await Favorite.findById(favorites._id)
      .populate('restaurants', 'name image cuisine rating')
      .populate('menuItems', 'name image price restaurant');

    res.status(200).json({
      success: true,
      message: 'Restaurant added to favorites',
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove restaurant from favorites
// @route   DELETE /api/favorites/restaurant/:restaurantId
// @access  Private (Customer)
exports.removeRestaurantFromFavorites = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const favorites = await Favorite.findOne({ user: req.user.id });

    if (!favorites) {
      return res.status(404).json({
        success: false,
        message: 'Favorites not found'
      });
    }

    favorites.restaurants = favorites.restaurants.filter(
      id => id.toString() !== restaurantId
    );

    await favorites.save();

    const updatedFavorites = await Favorite.findById(favorites._id)
      .populate('restaurants', 'name image cuisine rating')
      .populate('menuItems', 'name image price restaurant');

    res.status(200).json({
      success: true,
      message: 'Restaurant removed from favorites',
      data: updatedFavorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add menu item to favorites
// @route   POST /api/favorites/menuitem/:menuItemId
// @access  Private (Customer)
exports.addMenuItemToFavorites = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    let favorites = await Favorite.findOne({ user: req.user.id });

    if (!favorites) {
      favorites = await Favorite.create({
        user: req.user.id,
        restaurants: [],
        menuItems: [menuItemId]
      });
    } else {
      // Check if already in favorites
      if (favorites.menuItems.includes(menuItemId)) {
        return res.status(400).json({
          success: false,
          message: 'Menu item already in favorites'
        });
      }

      favorites.menuItems.push(menuItemId);
      await favorites.save();
    }

    favorites = await Favorite.findById(favorites._id)
      .populate('restaurants', 'name image cuisine rating')
      .populate('menuItems', 'name image price restaurant');

    res.status(200).json({
      success: true,
      message: 'Menu item added to favorites',
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove menu item from favorites
// @route   DELETE /api/favorites/menuitem/:menuItemId
// @access  Private (Customer)
exports.removeMenuItemFromFavorites = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    const favorites = await Favorite.findOne({ user: req.user.id });

    if (!favorites) {
      return res.status(404).json({
        success: false,
        message: 'Favorites not found'
      });
    }

    favorites.menuItems = favorites.menuItems.filter(
      id => id.toString() !== menuItemId
    );

    await favorites.save();

    const updatedFavorites = await Favorite.findById(favorites._id)
      .populate('restaurants', 'name image cuisine rating')
      .populate('menuItems', 'name image price restaurant');

    res.status(200).json({
      success: true,
      message: 'Menu item removed from favorites',
      data: updatedFavorites
    });
  } catch (error) {
    next(error);
  }
};