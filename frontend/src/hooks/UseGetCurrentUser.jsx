import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          return;
        }

        const response = await axios.get(`${serverUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          dispatch(setUserData(response.data.data));
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        // If token is invalid, clear it
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          dispatch(setUserData(null));
        }
      }
    };

    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;