// src/redux/appointmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspaces: [],
};

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      // Flatten and normalize if needed
      state.workspaces = action.payload;
    }
  },
});

export const workspacesActions = workspacesSlice.actions;
export default workspacesSlice;
