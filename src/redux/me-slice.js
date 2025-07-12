// src/redux/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  me: {},
};

const mySlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setMyself: (state, action) => {
      // Flatten and normalize if needed
      state.me = action.payload;
    }
  },
});

export const myActions = mySlice.actions;
export default mySlice;
