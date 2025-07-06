import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

// Usage: useListAzureBlobFiles({ connectionString, containerName, blobPath, fileType })
export function useListAzureBlobFiles() {
  return useMutation({
    mutationFn: async ({ connectionString, containerName, blobPath, fileType }) => {
      const response = await axios.post(
        `${BACKEND_URL}/api/connection/abs/files`,
        {
          connectionString,
          containerName,
          blobPath,
          fileType,
        }
      );
      return response.data;
    },
  });
}
