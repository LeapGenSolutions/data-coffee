import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../constants";

export default function useDeletePipelineHistory() {
  return useMutation({
    mutationFn: async ({ id, email }) => {
      if (!id) throw new Error("Missing run history id");
      if (!email) throw new Error("Missing user email");

      // NOTE: order matters: /:email/run-history/:id
      const url = `${BACKEND_URL}/api/pipeline/${encodeURIComponent(email)}/run-history/${encodeURIComponent(id)}`;

      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text().catch(() => "");

      if (!res.ok) {
        throw new Error(body || `Delete failed (HTTP ${res.status})`);
      }
      return true;
    },
  });
}
