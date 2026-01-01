import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgcolor = "#fff9f6";
  const borderColor = "#ddd";

  // Sync role with formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, role }));
  }, [role]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting form data:", formData);
      
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        formData,  // ✅ Send entire formData object
        { withCredentials: true }
      );

      console.log("Signup success:", result.data);

      // Store user data in Redux
      if (result.data.user) {
        dispatch(setUserData(result.data.user));
      }

      // Show success message (optional)
      alert("Account created successfully!");

      // Redirect to home page
      navigate("/");
      
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = 
        error.response?.data?.message || 
        "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgcolor }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: primaryColor }}
          >
            Crave Connect
          </h1>
          <p className="text-gray-600 text-sm">
            Sign up to connect from our kitchen to your cravings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="Enter your full name"
              style={{ borderColor }}
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="Enter your email"
              style={{ borderColor }}
              required
              disabled={loading}
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="Enter 10-digit mobile number"
              style={{ borderColor }}
              pattern="[0-9]{10}"
              maxLength="10"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                placeholder="Enter password (min 8 characters)"
                style={{ borderColor }}
                minLength="8"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Role
            </label>
            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={loading}
                  className="flex-1 border rounded-lg px-3 py-2 font-medium transition capitalize disabled:opacity-50"
                  style={
                    role === r
                      ? { backgroundColor: primaryColor, color: "white" }
                      : { borderColor, color: "#333" }
                  }
                >
                  {r === "deliveryBoy" ? "Delivery" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) =>
              !loading && (e.target.style.backgroundColor = hoverColor)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = primaryColor)
            }
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign In */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <span
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => !loading && navigate("/signin")}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;