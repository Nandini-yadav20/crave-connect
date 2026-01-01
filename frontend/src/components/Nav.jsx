import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiLogOut, FiShoppingBag, FiUser, FiPlusCircle } from "react-icons/fi";
import { MdFastfood } from "react-icons/md";
import { serverUrl } from "../App";
import { setUserData, setCity } from "../redux/userSlice";

function Nav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, city } = useSelector((state) => state.user);
  const isOwner = userData?.role === "owner";

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
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      dispatch(setCity(""));
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className="w-full h-[80px] flex items-center justify-between 
      md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] 
      bg-[#fff9f6]"
    >
      {/* Logo */}
      <h1
        className="text-3xl font-bold text-[#ff4d2d] cursor-pointer"
        onClick={() => navigate("/")}
      >
        Crave Connect
      </h1>

      {/* Search Box */}
      <div
        className="md:w-[60%] lg:w-[40%] h-[70px] bg-white 
        shadow-xl rounded-lg flex items-center gap-[20px] px-4"
      >
        {/* Location */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleGetLocation}
        >
          <FaLocationDot
            className={`text-[#ff4d2d] ${
              locationLoading ? "animate-pulse" : ""
            }`}
            size={20}
          />
          <span className="text-sm text-gray-600 truncate max-w-[120px]">
            {locationLoading
              ? "Detecting..."
              : locationError
              ? "Retry"
              : city || "Detect location"}
          </span>
        </div>

        {/* Search */}
        <div className="w-[70%] flex items-center gap-[10px]">
          <IoIosSearch size={25} className="text-[#ff4d2d]" />
          <input
            type="text"
            placeholder="Search delicious food..."
            className="w-full outline-none text-sm"
          />
        </div>
      </div>

      {/* User Orders */}
      <button
        className="hidden md:flex items-center gap-2 px-3 py-1 
        rounded-lg bg-[#ff4d2d]/10 text-sm font-medium 
        hover:bg-[#ff4d2d]/20 transition"
        onClick={() => navigate("/orders")}
      >
        <FiShoppingBag />
        My Orders
      </button>

      {/* OWNER BUTTONS */}
      {isOwner && (
        <>
          <button
            className="hidden md:flex items-center gap-2 px-3 py-1 
            rounded-lg bg-[#ff4d2d]/10 text-sm font-medium 
            hover:bg-[#ff4d2d]/20 transition"
            onClick={() => navigate("/add-item")}
          >
            <FiPlusCircle />
            Add Item
          </button>

          <button
            className="hidden md:flex items-center gap-2 px-3 py-1 
            rounded-lg bg-[#ff4d2d]/10 text-sm font-medium 
            hover:bg-[#ff4d2d]/20 transition"
            onClick={() => navigate("/owner-orders")}
          >
            <MdFastfood />
            Owner Orders
          </button>
        </>
      )}

      {/* Avatar */}
      <div
        onClick={() => setShowInfo(!showInfo)}
        className="w-9 h-9 rounded-full bg-[#ff4d2d] 
        text-white flex items-center justify-center font-semibold 
        cursor-pointer"
      >
        {userData?.fullName?.[0]?.toUpperCase() || <FiUser />}
      </div>

      {/* Dropdown */}
      {showInfo && (
        <div
          className="fixed top-[80px] right-[10px] w-[200px] 
          bg-white shadow-2xl rounded-xl p-[15px] 
          flex flex-col gap-[12px]"
        >
          <div className="font-semibold text-gray-700">
            {userData?.fullName || "Guest User"}
          </div>

          {userData?.email && (
            <div className="text-[12px] text-gray-500 truncate">
              {userData.email}
            </div>
          )}

          <div
            className="flex items-center gap-2 text-[#ff4d2d] font-semibold cursor-pointer"
            onClick={() => navigate("/orders")}
          >
            <FiShoppingBag />
            My Orders
          </div>

          {isOwner && (
            <>
              <div
                className="flex items-center gap-2 text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/add-item")}
              >
                <FiPlusCircle />
                Add Item
              </div>

              <div
                className="flex items-center gap-2 text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/owner-orders")}
              >
                <MdFastfood />
                Owner Orders
              </div>
            </>
          )}

          <div
            className="flex items-center gap-2 text-[#ff4d2d] font-semibold cursor-pointer"
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
