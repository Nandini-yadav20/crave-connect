import express from "express";
import { addOrEditItem } from "../controllers/item.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

// Add item
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  addOrEditItem
);

// Edit item
router.put(
  "/:itemId",
  authMiddleware,
  upload.single("image"),
  addOrEditItem
);

export default itemRouter;
