import React from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";
import { MdDeliveryDining } from "react-icons/md";

function DeliveryBoyDashboard() {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6]">
      <Nav />

      <div className="pt-[120px] px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center 
          justify-center mx-auto mb-6">
            <MdDeliveryDining className="text-green-600 text-4xl" />
          </div>

          <h2 className="text-2xl font-bold mb-3">
            Welcome, {userData?.fullName}!
          </h2>

          <p className="text-gray-600 mb-6">
            Your delivery dashboard is coming soon. You'll be able to see and manage 
            delivery orders here.
          </p>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <ul className="text-left space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                View available orders
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Track your earnings
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Manage delivery routes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Real-time order updates
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🚧 Delivery features are currently under development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;