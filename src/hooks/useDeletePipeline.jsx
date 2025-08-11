import { useMutation } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';

export default function useDeletePipeline() {
  return useMutation({
    mutationFn: async ({ id, email }) => {
      const res = await fetch(
        `${BACKEND_URL}/api/pipeline/${encodeURIComponent(email)}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to delete pipeline");
      }
      return true;
    }
  });
}