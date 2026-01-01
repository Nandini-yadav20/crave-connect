import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

function CreateEditShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);
  const { city: userCity, state: userState } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || "");
  const [city, setCity] = useState(myShopData?.city || userCity || "");
  const [state, setState] = useState(myShopData?.state || userState || "");
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMyShopData(result.data));
      navigate("/owner-dashboard");
    } catch (error) {
      console.error("Create/Edit shop error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center relative">
      
      {/* Back Button */}
      <div
        className="absolute top-6 left-6 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={36} className="text-[#ff4d2d]" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-6 py-8">
        
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-[#ffe3dc] flex items-center justify-center">
            <FaUtensils className="text-[#ff4d2d] text-2xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          {myShopData ? "Edit Shop" : "Add Shop"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Shop Name"
              className="w-full mt-1 px-4 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              required
            />
          </div>

          {/* Shop Image */}
          <div>
            <label className="text-sm text-gray-600">Shop Image</label>
            <input
              type="file"
              onChange={(e) => setBackendImage(e.target.files[0])}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm
              file:mr-3 file:py-1.5 file:px-3 
              file:border-0 file:rounded-md
              file:bg-gray-100 file:text-gray-700"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Shop Address"
              className="w-full mt-1 px-4 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#ff4d2d] text-white py-2 rounded-md 
            font-semibold hover:bg-[#e64526] transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Shop"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
