import express from "express"
import {createEditShop} from "../controllers/shop.controller.js"
import isAuth from "../middlewares/isAuth"
import {upload } from "../middlewares/multer.js"

const shopRoute = express.Router()
shopRoute.get("/create-edit",isAuth,UploadStream.sigle("image"),createEditShop)
shopRoute.get("/get-my",isAuth,getMyShop)
export default shopRoute