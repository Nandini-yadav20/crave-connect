import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  role: "owner",
  myShopData: null,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload;
    },
    clearMyShopData: (state) => {
      state.myShopData = null;
    },
  },
});

export const { setMyShopData, clearMyShopData } = shopSlice.actions;
export default shopSlice.reducer;
