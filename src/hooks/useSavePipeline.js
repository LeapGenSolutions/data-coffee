import axios from 'axios';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';

export default function useSavePipeline() {
  // Get current user email from Redux state
  const currentUserEmail = useSelector(state => state.me.me?.email);

  return useMutation({
    mutationFn: async (pipeline) => {
      if (!currentUserEmail) {
        throw new Error("User email is not available");
      }
      const response = await axios.post(
        `${BACKEND_URL}/api/pipeline/${encodeURIComponent(currentUserEmail)}`,
        pipeline
      );
      return response.data;
    }
  });
}

export const useClonePipeline = () => {
  return useMutation({
    mutationFn: async ({ user_id, pipeline_id }) => {
      const response = await fetch(`${BACKEND_URL}/api/pipeline/${user_id}/${pipeline_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to clone pipeline");
      return await response.json();
    },
  });
};