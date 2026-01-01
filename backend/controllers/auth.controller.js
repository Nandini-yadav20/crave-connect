import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import sendOtpMail from "../utils/sendOtpMail.js"; // Add this import

/* SIGNUP */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password should be at least 8 characters long",
      });
    }

    if (mobile.toString().length !== 10) {
      return res.status(400).json({
        message: "Mobile number should contain exactly 10 digits",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Signup error",
      error: error.message,
    });
  }
};

/* SIGNIN */
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = await genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Signin error",
      error: error.message,
    });
  }
};

/* SIGNOUT */
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Sign out error",
      error: error.message,
    });
  }
};

/* SEND OTP */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist. Try signing up.",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isOtpVerified = false;

    await user.save();
    await sendOtpMail(email, otp);

    return res.status(200).json({
      message: "OTP sent to registered email account",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Send OTP error",
      error: error.message,
    });
  }
};

/* VERIFY OTP */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "OTP verification error",
      error: error.message,
    });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({
        message: "OTP verification required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password should be at least 8 characters long",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.isOtpVerified = false; // reset flag after password change

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Reset password error",
      error: error.message,
    });
  }
};