import express from "express";
import {
  getAllRestaurants,
  getRestaurant,
  getRestaurantMenu,
  searchAll,
} from "../controllers/restaurant.controller.js";

const router = express.Router();

router.get("/", getAllRestaurants);
router.get("/search/all", searchAll);
router.get("/:id", getRestaurant);
router.get("/:id/menu", getRestaurantMenu);

export default router;
