import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export default function useFetchPipelineById(pipelineId) {
  const email = useSelector(s => s.me.me?.email);

  return useQuery({
    queryKey: ["pipelineById", email, pipelineId],
    enabled: !!email && !!pipelineId,
    queryFn: async () => {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/pipeline/${encodeURIComponent(email)}/${encodeURIComponent(pipelineId)}`
      );
      return data; // a single pipeline config document
    },
  });
}
