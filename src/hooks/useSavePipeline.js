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
