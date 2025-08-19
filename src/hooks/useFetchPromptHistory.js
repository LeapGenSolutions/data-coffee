import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';

export default function useFetchPromptHistory(pipelineId) {
    const queryKey = ["promptHistory", pipelineId];
    const queryFn = async () => {
        if(!pipelineId) throw new Error('Missing pipelineId');

        const response = await axios.get(`${BACKEND_URL}/api/pipeline/${encodeURIComponent(pipelineId)}/promptHistory`);
        return response.data || [];
    }

    const { data, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn,
        enabled: Boolean(pipelineId)
    });

    return { promptHistory: data, isLoading, error, refetch };
}