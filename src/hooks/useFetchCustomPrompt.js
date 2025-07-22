import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export default function useFetchCustomPrompt() {
  return useMutation({
    mutationFn: async ({ pipelineID }) => {
      const url = `https://seismicdockerbackend-fthfbxbscbcwe3hr.centralus-01.azurewebsites.net/feedback/${pipelineID}/redaction`;
      const response = await axios.post(url);
      return response.data;
    }
  });
}
