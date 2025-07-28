// src/hooks/useDeleteSource.js
import { useMutation } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';

export default function useDeleteSource() {
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const response = await fetch(
        `${BACKEND_URL}/api/source/${encodeURIComponent(userId)}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete source");
      }
      return true;
    }
  });
}
