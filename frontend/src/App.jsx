import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";

// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import RestaurantList from "./pages/RestaurantList";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Favorites from "./pages/Favorites";
import CreateEditRestaurant from "./pages/createEditShop";

// Owner
import OwnerDashboard from "./components/OwnerDashboard";
import ManageMenu from "./pages/ManageMenu";
import AddMenuItem from "./pages/AddMenuItem";
import OwnerOrders from "./pages/OwnerOrders";

// Delivery
import DeliveryDashboard from "./components/DeliveryDashboard";
import AvailableOrders from "./components/AvailableOrders";
import ActiveDelivery from "./pages/ActiveDelivery";
import DeliveryHistory from "./pages/DeliveryHistory";

// Hooks
import useGetCurrentUser from "./hooks/useGetCurrentUser";


export const serverUrl = "http://localhost:8000";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userData } = useSelector((state) => state.user);
  
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  // Fetch current user on app load
  useGetCurrentUser();

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <RestaurantList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Favorites />
            </ProtectedRoute>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/restaurant"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <CreateEditRestaurant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/menu"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <ManageMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/menu/add"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddMenuItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/menu/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddMenuItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/orders"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerOrders />
            </ProtectedRoute>
          }
        />

        {/* Delivery Routes */}
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/available"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <AvailableOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/active"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <ActiveDelivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/history"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryHistory />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;