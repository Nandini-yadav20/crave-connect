import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaLocationDot, FaHeart } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiLogOut, FiShoppingBag, FiUser, FiPlusCircle } from "react-icons/fi";
import { MdFastfood, MdDashboard } from "react-icons/md";
import { setUserData, setCity } from "../redux/userSlice";

function Nav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, city } = useSelector((state) => state.user);
  const [showInfo, setShowInfo] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Get city name from coordinates
  const getCityFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        "Unknown Location"
      );
    } catch (error) {
      console.error("Error fetching city:", error);
      return "Location unavailable";
    }
  };

  // Detect location
  const handleGetLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await getCityFromCoordinates(latitude, longitude);
        dispatch(setCity(cityName));
        setLocationLoading(false);
      },
      (error) => {
        let msg = "Unable to retrieve location";
        if (error.code === 1) msg = "Permission denied";
        if (error.code === 2) msg = "Location unavailable";
        if (error.code === 3) msg = "Request timeout";

        setLocationError(msg);
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    if (!city) handleGetLocation();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setUserData(null));
    dispatch(setCity(""));
    navigate("/signin");
  };

  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-white shadow-md">
      {/* Logo */}
      <h1
        className="text-2xl md:text-3xl font-bold text-[#ff4d2d] cursor-pointer"
        onClick={() => navigate("/")}
      >
        Crave Connect
      </h1>

      {/* Search Box - Only for customers */}
      {userData?.role === 'customer' && (
        <div className="hidden md:flex w-[40%] lg:w-[30%] h-[50px] bg-gray-50 rounded-lg items-center gap-[15px] px-4 border border-gray-200">
          {/* Location */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-[#ff4d2d] transition"
            onClick={handleGetLocation}
          >
            <FaLocationDot
              className={`text-[#ff4d2d] ${locationLoading ? "animate-pulse" : ""}`}
              size={18}
            />
            <span className="text-sm text-gray-600 truncate max-w-[100px]">
              {locationLoading
                ? "Detecting..."
                : locationError
                ? "Retry"
                : city || "Detect location"}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-[10px]">
            <IoIosSearch size={22} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="hidden md:flex items-center gap-3">
        {/* Customer Navigation */}
        {userData?.role === 'customer' && (
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/restaurants")}
            >
              <MdFastfood />
              Restaurants
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/cart")}
            >
              <FiShoppingBag />
              Cart
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/favorites")}
            >
              <FaHeart />
              Favorites
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/orders")}
            >
              <FiShoppingBag />
              Orders
            </button>
          </>
        )}

        {/* Owner Navigation */}
        {userData?.role === 'owner' && (
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/owner/dashboard")}
            >
              <MdDashboard />
              Dashboard
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/owner/menu")}
            >
              <MdFastfood />
              Menu
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/owner/orders")}
            >
              <FiShoppingBag />
              Orders
            </button>
          </>
        )}

        {/* Delivery Navigation */}
        {userData?.role === 'delivery' && (
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/delivery/dashboard")}
            >
              <MdDashboard />
              Dashboard
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/delivery/available")}
            >
              <FiShoppingBag />
              Available
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff4d2d]/10 text-sm font-medium transition"
              onClick={() => navigate("/delivery/active")}
            >
              <FiPlusCircle />
              Active
            </button>
          </>
        )}
      </div>

      {/* Avatar */}
      <div
        onClick={() => setShowInfo(!showInfo)}
        className="w-9 h-9 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center font-semibold cursor-pointer hover:bg-[#e64323] transition"
      >
        {userData?.name?.[0]?.toUpperCase() || <FiUser />}
      </div>

      {/* Dropdown */}
      {showInfo && (
        <div className="fixed top-[80px] right-[10px] w-[220px] bg-white shadow-2xl rounded-xl p-[15px] flex flex-col gap-[12px] border border-gray-100">
          <div className="font-semibold text-gray-800 border-b pb-2">
            {userData?.name || "Guest User"}
          </div>

          {userData?.email && (
            <div className="text-[12px] text-gray-500 truncate">
              {userData.email}
            </div>
          )}

          <div className="text-xs text-gray-400 capitalize">
            {userData?.role}
          </div>

          {/* Role-specific menu items */}
          {userData?.role === 'customer' && (
            <>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/restaurants"); }}
              >
                <MdFastfood />
                Browse Restaurants
              </div>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/cart"); }}
              >
                <FiShoppingBag />
                My Cart
              </div>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/orders"); }}
              >
                <FiShoppingBag />
                My Orders
              </div>
            </>
          )}

          {userData?.role === 'owner' && (
            <>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/owner/dashboard"); }}
              >
                <MdDashboard />
                Dashboard
              </div>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/owner/orders"); }}
              >
                <MdFastfood />
                Manage Orders
              </div>
            </>
          )}

          {userData?.role === 'delivery' && (
            <>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/delivery/dashboard"); }}
              >
                <MdDashboard />
                Dashboard
              </div>
              <div
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] font-medium cursor-pointer py-1"
                onClick={() => { setShowInfo(false); navigate("/delivery/available"); }}
              >
                <FiShoppingBag />
                Available Orders
              </div>
            </>
          )}

          <div
            className="flex items-center gap-2 text-[#ff4d2d] font-semibold cursor-pointer pt-2 border-t"
            onClick={handleLogout}
          >
            <FiLogOut />
            Log Out
          </div>
        </div>
      )}
    </div>
  );
}

export default Nav;