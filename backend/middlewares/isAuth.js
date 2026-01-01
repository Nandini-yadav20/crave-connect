import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies.token;

    // 2. Check token existence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user id to request
    req.userId = decoded.id;

    // 5. Continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default authMiddleware;
