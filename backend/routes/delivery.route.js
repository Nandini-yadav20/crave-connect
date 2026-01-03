const express = require('express');
const {
  getAvailableOrders,
  acceptOrder,
  getMyDeliveryOrders,
  getActiveDelivery,
  updateLocation,
  markOnTheWay,
  markDelivered,
  toggleAvailability,
  getDashboardStats,
  updateProfile
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('delivery'));

router.get('/available-orders', getAvailableOrders);
router.put('/accept-order/:orderId', acceptOrder);
router.get('/my-orders', getMyDeliveryOrders);
router.get('/active-delivery', getActiveDelivery);
router.put('/update-location', updateLocation);
router.put('/orders/:orderId/on-the-way', markOnTheWay);
router.put('/orders/:orderId/delivered', markDelivered);
router.put('/toggle-availability', toggleAvailability);
router.get('/dashboard', getDashboardStats);
router.put('/profile', updateProfile);

module.exports = router;