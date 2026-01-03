import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleRoleChange = (newRole) => {
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/register`,
        formData
      );

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Store user data in Redux
        dispatch(setUserData(response.data.user));

        // Navigate based on role
        const { role } = response.data.user;
        if (role === 'owner') {
          navigate('/owner/dashboard');
        } else if (role === 'delivery') {
          navigate('/delivery/dashboard');
        } else {
          navigate('/restaurants');
        }
      }
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#ff4d2d]">
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] transition"
              placeholder="Enter your full name"
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
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] transition"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] transition"
              placeholder="Enter 10-digit phone number"
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
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] transition"
                placeholder="Enter password (min 6 characters)"
                minLength="6"
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
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              I want to sign up as
            </label>
            <div className="flex gap-2">
              {[
                { value: "customer", label: "Customer" },
                { value: "owner", label: "Restaurant Owner" },
                { value: "delivery", label: "Delivery Partner" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRoleChange(option.value)}
                  disabled={loading}
                  className={`flex-1 border rounded-lg px-3 py-2 font-medium transition capitalize text-sm disabled:opacity-50 ${
                    formData.role === option.value
                      ? 'bg-[#ff4d2d] text-white border-[#ff4d2d]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff4d2d]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] hover:bg-[#e64323] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign In */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <span
              className="font-semibold cursor-pointer hover:underline text-[#ff4d2d]"
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