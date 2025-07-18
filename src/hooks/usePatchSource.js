import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export function usePatchSource() {
  return useMutation({
    mutationFn: async ({ email, id, updates }) => {

      const response = await axios.patch(
        `${BACKEND_URL}/api/source/${encodeURIComponent(email)}/${id}`,
        {
          id,
          partitionIdentifier: email,
          data: updates
        }
      );
      return response.data;
    }
  });
}


