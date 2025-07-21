import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

export default function useFetchPipelineHistory() {
    const userEmail = useSelector(state => state.me.me?.email);
    const queryKey = ["pipelineHistory", userEmail];
    const queryFn = async () => {
        if( !userEmail) {
            throw new Error('Missing user email');
        }
        const response = await axios.get(
            `${BACKEND_URL}/api/pipeline/run-history/${encodeURIComponent(userEmail)}`
        );
        return response.data;
    }
    const {data, isLoading, error, refetch} = useQuery({
        queryKey,
        queryFn,
        enabled: !!userEmail,
    });
    return { source: data, isLoading, error, refetch };
}