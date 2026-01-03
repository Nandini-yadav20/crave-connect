import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { cuisine, search, isOpen, sortBy, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (cuisine) query.cuisine = { $in: [cuisine] };
    if (isOpen !== undefined) query.isOpen = isOpen === "true";
    if (search) query.name = { $regex: search, $options: "i" };

    let sort = {};
    switch (sortBy) {
      case "rating":
        sort = { rating: -1 };
        break;
      case "name":
        sort = { name: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const restaurants = await Restaurant.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const count = await Restaurant.countDocuments(query);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single restaurant with menu
export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const menuItems = await MenuItem.find({
      restaurant: req.params.id,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    res.json({ success: true, data: { restaurant, menuItems } });
  } catch (error) {
    next(error);
  }
};

// @desc Get restaurant menu
export const getRestaurantMenu = async (req, res, next) => {
  try {
    const { category, isVeg, sortBy } = req.query;

    const query = { restaurant: req.params.id };
    if (category) query.category = category;
    if (isVeg !== undefined) query.isVeg = isVeg === "true";

    let sort = {};
    switch (sortBy) {
      case "price-low":
        sort = { price: 1 };
        break;
      case "price-high":
        sort = { price: -1 };
        break;
      case "rating":
        sort = { rating: -1 };
        break;
      default:
        sort = { category: 1, name: 1 };
    }

    const menuItems = await MenuItem.find(query).sort(sort);

    res.json({ success: true, count: menuItems.length, data: menuItems });
  } catch (error) {
    next(error);
  }
};

// @desc Search restaurants & menu items
export const searchAll = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ message: "Search query required" });

    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { cuisine: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    }).limit(5);

    const menuItems = await MenuItem.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
      isAvailable: true,
    })
      .populate("restaurant", "name")
      .limit(10);

    res.json({ success: true, data: { restaurants, menuItems } });
  } catch (error) {
    next(error);
  }
};
