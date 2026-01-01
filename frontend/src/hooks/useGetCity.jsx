import axios from "axios";
import { useDispatch } from "react-redux";
import { setCity, setCurrentAddress, setState } from "../redux/userSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apikey = import.meta.env.VITE_GEOAPIKEY;

  const getCity = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      dispatch(setCity("Location not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                apiKey: apikey,
              },
            }
          );

          // ✅ SAFE ACCESS
          const results = res?.data?.results;

          if (!Array.isArray(results) || results.length === 0) {
            dispatch(setCity("Unknown location"));
            return;
          }

          const city =
            results[0]?.city ||
            results[0]?.town ||
            results[0]?.village ||
            results[0]?.county ||
            "Unknown";

          dispatch(setCity(result?.data?.results[0].city));
          dispatch(setState(result?.data?.results[0].state))
          dispatch(setCurrentAddress(result?.data?.results[0].address))
        } catch (error) {
          console.error("City fetch error:", error);
          dispatch(setCity("Location error"));
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        dispatch(setCity("Permission denied"));
      }
    );
  };

  return getCity;
}

export default useGetCity;
