import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      // Redirect based on user role
      switch (userData.role) {
        case 'customer':
          navigate('/restaurants');
          break;
        case 'owner':
          navigate('/owner/dashboard');
          break;
        case 'delivery':
          navigate('/delivery/dashboard');
          break;
        default:
          navigate('/restaurants');
      }
    }
  }, [userData, navigate]);

  // Loading state while redirecting
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#fff9f6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default Home;