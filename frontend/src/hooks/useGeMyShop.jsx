import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetMyShop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/current`,
          { withCredentials: true }
        );

        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchShop();
  }, [dispatch]);
}

export default useGetCurrentUser;
