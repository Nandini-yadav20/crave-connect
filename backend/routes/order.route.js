const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  rateOrder,
  getOrderStatistics
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), createOrder);
router.get('/my-orders', authorize('customer'), getMyOrders);
router.get('/statistics', authorize('customer'), getOrderStatistics);
router.get('/:id', getOrder);
router.put('/:id/cancel', authorize('customer'), cancelOrder);
router.put('/:id/rate', authorize('customer'), rateOrder);

module.exports = router;