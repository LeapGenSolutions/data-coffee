// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import mySlice from './me-slice';

export const store = configureStore({
  reducer: {
    me: mySlice.reducer
  },
});
