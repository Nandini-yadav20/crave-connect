const express = require('express');
const {
  getFavorites,
  addRestaurantToFavorites,
  removeRestaurantFromFavorites,
  addMenuItemToFavorites,
  removeMenuItemFromFavorites
} = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('customer'));

router.get('/', getFavorites);
router.post('/restaurant/:restaurantId', addRestaurantToFavorites);
router.delete('/restaurant/:restaurantId', removeRestaurantFromFavorites);
router.post('/menuitem/:menuItemId', addMenuItemToFavorites);
router.delete('/menuitem/:menuItemId', removeMenuItemFromFavorites);

module.exports = router;