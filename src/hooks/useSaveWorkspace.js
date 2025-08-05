// hooks/useSaveWorkspace.js
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export function useSaveWorkspace() {
  return useMutation({
    mutationFn: async ({ email, workspace }) => {
      const response = await axios.post(
        `${BACKEND_URL}/api/workspaces/${encodeURIComponent(email)}`,
        workspace
      );
      return response.data;
    },
  });
}
