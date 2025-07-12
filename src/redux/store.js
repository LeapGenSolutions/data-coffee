// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import mySlice from './me-slice';
import workspacesSlice from './workspace-slice';

export const store = configureStore({
  reducer: {
    me: mySlice.reducer,
    workspaces: workspacesSlice.reducer
  },
});
