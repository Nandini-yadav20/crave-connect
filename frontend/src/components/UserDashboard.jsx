import React, { useState } from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";

// Category icons
import { CiPizza } from "react-icons/ci";
import { FaHamburger, FaShoppingBag, FaHeart, FaStar } from "react-icons/fa";
import { GiNoodles, GiCakeSlice, GiFrenchFries } from "react-icons/gi";
import { MdDeliveryDining } from "react-icons/md";

function UserDashboard() {
  const { userData, city } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [active, setActive] = useState(null);

  const featuredRestaurants = [
    {
      id: 1,
      name: "Spice Kitchen",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      rating: 4.5,
      cuisine: "North Indian",
      deliveryTime: "30-40 min",
      distance: "2.5 km",
    },
    {
      id: 2,
      name: "Burger Hub",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
      rating: 4.2,
      cuisine: "Fast Food",
      deliveryTime: "20-30 min",
      distance: "1.8 km",
    },
    {
      id: 3,
      name: "Pizza Palace",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      rating: 4.7,
      cuisine: "Italian",
      deliveryTime: "25-35 min",
      distance: "3.2 km",
    },
  ];

  const categories = [
    { name: "Pizza", icon: <CiPizza /> },
    { name: "Burgers", icon: <FaHamburger /> },
    { name: "Chinese", icon: <GiNoodles /> },
    { name: "Desserts", icon: <GiCakeSlice /> },
    { name: "Indian", icon: <GiFrenchFries /> },
    { name: "Fast Food", icon: <GiFrenchFries /> },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#fff7f3] to-[#fefefe]">
      <Nav />

      <div className="pt-[110px] px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#ff4d2d] via-[#ff6b4a] to-[#ff9075] rounded-3xl p-8 mb-10 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {userData?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-white/90 text-lg">
              Discover great food near {city || "you"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard icon={<FaShoppingBag />} value="12" label="Orders" color="orange" />
            <StatCard icon={<FaHeart />} value="8" label="Favorites" color="red" />
            <StatCard icon={<MdDeliveryDining />} value="2" label="Active" color="green" />
            <StatCard icon={<FaStar />} value="4.8" label="Rating" color="yellow" />
          </div>

          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              Browse by Category
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-5">
              {categories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => setActive(category.name)}
                  className={`rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 backdrop-blur-lg
                  ${
                    active === category.name
                      ? "bg-[#ff4d2d] text-white shadow-2xl scale-105"
                      : "bg-white/80 hover:shadow-xl hover:scale-105"
                  }`}
                >
                  <div
                    className={`text-4xl mb-3 transition-colors ${
                      active === category.name
                        ? "text-white"
                        : "text-[#ff4d2d]"
                    }`}
                  >
                    {category.icon}
                  </div>
                  <p className="text-sm font-semibold tracking-wide">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Restaurants */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              Popular Restaurants
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white/90 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-52 w-full object-cover"
                  />

                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1">
                      {restaurant.name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-3">
                      {restaurant.cuisine}
                    </p>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <FaStar className="text-yellow-500" />
                        {restaurant.rating}
                      </span>
                      <span>{restaurant.deliveryTime}</span>
                      <span>{restaurant.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ icon, value, label, color }) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-500",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-500",
  };

  return (
    <div className="bg-white/90 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colors[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold">{value}</p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
