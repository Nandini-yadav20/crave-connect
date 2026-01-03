import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authroutes.js";

import shopRoute from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes - FIXED: Added leading slashes

app.use("/api/shop", shopRoute);
app.use("/api/item", itemRouter);

app.use("/api/auth", authRouter);

// Server
app.listen(port, () => {
  connectDb();
  console.log(`Server started at port ${port}`);
});
