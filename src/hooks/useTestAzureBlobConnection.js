import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export function useTestAzureBlobConnection() {
  return useMutation({
    mutationFn: async ({ connectionString, containerName }) => {
      const response = await axios.post(`${BACKEND_URL}/api/connection/abs`, {
        connectionString,
        containerName,
      });
      return response.data;
    },
  });
}
