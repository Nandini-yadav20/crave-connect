const express = require('express');
const {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  toggleRestaurantStatus,
  addMenuItem,
  getMyMenuItems,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getRestaurantOrders,
  updateOrderStatus,
  getDashboardStats
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('owner'));

// Restaurant routes
router.post('/restaurant', createRestaurant);
router.get('/restaurant', getMyRestaurant);
router.put('/restaurant', updateRestaurant);
router.put('/restaurant/toggle-status', toggleRestaurantStatus);

// Menu item routes
router.post('/menu-items', addMenuItem);
router.get('/menu-items', getMyMenuItems);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);
router.put('/menu-items/:id/toggle-availability', toggleMenuItemAvailability);

// Order routes
router.get('/orders', getRestaurantOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;