import express from "express";

const router = express.Router();
import protect from "../middlewares/auth.js";

router.post("/login", (req, res) => {
  res.json({ message: "Login route" });
});

router.post("/register", (req, res) => {
  res.json({ message: "Register route" });
});


// GET current logged-in user
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});



export default router;
