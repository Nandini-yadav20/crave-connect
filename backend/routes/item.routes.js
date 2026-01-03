import express from "express";
import { addOrEditItem } from "../controllers/item.controller.js";
import authMiddleware from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

// Add item
itemRouter.post(
  "/",
  authMiddleware,
  upload.single("image"),
  addOrEditItem
);

// Edit item
itemRouter.put(
  "/:itemId",
  authMiddleware,
  upload.single("image"),
  addOrEditItem
);

export default itemRouter;
