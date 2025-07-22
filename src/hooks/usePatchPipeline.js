import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

function usePatchPipeline() {
  return useMutation({
    mutationFn: async ({ email, pipelineId, pipeline }) => {
      if (!email || !pipelineId || !pipeline) {
        throw new Error('email, pipelineId, and pipeline are required');
      }
      const url = `${BACKEND_URL}/api/pipeline/${email}/${pipelineId}`;
      const response = await axios.patch(url, pipeline);
      return response.data;
    }
  });
}

export default usePatchPipeline;
