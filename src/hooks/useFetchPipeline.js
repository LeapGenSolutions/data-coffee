import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

export default function useFetchPipeline(workspaceId) {
  const currentUserEmail = useSelector(state => state.me.me?.email);
  const queryKey = ["pipeline", currentUserEmail, workspaceId];

  const queryFn = async () => {
    if (!currentUserEmail || !workspaceId) throw new Error('Missing user email or workspaceId');
    const response = await axios.get(
        `${BACKEND_URL}/api/pipeline/${encodeURIComponent(currentUserEmail)}/workspace/${encodeURIComponent(workspaceId)}`,

    );
    return response.data || [];
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!currentUserEmail && !!workspaceId,
  });

  return { sources: data, isLoading, error, refetch };
}
