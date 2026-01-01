import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  city: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
    state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;


    },
    setState: (state, action) => {
      state.state = action.payload;
  },
  setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
  },
}
});

export const { setUserData, setCity,setCurrentAddress,setState } = userSlice.actions;
export default userSlice.reducer;