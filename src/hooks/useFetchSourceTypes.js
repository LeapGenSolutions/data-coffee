import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export const useFetchSourceTypes = () => {
  return useQuery({
    queryKey: ["source-types"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/sourcetype`);
      return res.data;
    },
  });
};