import { useMutation } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';
import axios from 'axios';


export function useRunPipeline() {
    return useMutation({
        mutationFn: async ({ pipeline_id, user_id, pipeline_name }) => {
            const response = await axios.post(`${BACKEND_URL}/api/pipeline/run`, {
                email: user_id,
                pipeline_id: pipeline_id,
                pipeline_name: pipeline_name
            });
            if (response.status !== 200) {
                const error = response.data || {};
                throw new Error(error.message || 'Failed to run Databricks pipeline');
            }
            return response.data;
        }
    });
}
