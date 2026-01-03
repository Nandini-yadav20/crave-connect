import express from "express";
import { createEditShop, getMyShop } from "../controllers/shop.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const shopRoute = express.Router();


shopRoute.post("/create-edit", isAuth, upload.single("image"), createEditShop);
shopRoute.get("/get-my", isAuth, getMyShop);

export default shopRoute;