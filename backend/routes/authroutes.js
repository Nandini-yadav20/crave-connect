import express from "express";
import { 
  signup, 
  signIn, 
  signOut,
  sendOtp, 
  verifyOtp, 
  resetPassword 
} from "../controllers/auth.controller.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/signin", signIn);

// Support both GET and POST for signout (for compatibility)
router.get("/signout", signOut);
router.post("/signout", signOut);

// Alternative logout route (if you prefer this naming)
router.get("/logout", signOut);
router.post("/logout", signOut);

// Password reset routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;