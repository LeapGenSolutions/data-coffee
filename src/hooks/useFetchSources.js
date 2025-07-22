import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

export default function useFetchSources(workspaceID) {
  const currentUserEmail = useSelector(state => state.me.me?.email);

  const queryKey = ["sources", currentUserEmail, workspaceID];

  const queryFn = async () => {
    if (!currentUserEmail || !workspaceID) throw new Error('Missing user email or workspaceID');
    const response = await axios.get(
        `${BACKEND_URL}/api/source/${encodeURIComponent(currentUserEmail)}/workspace/${encodeURIComponent(workspaceID)}`,
    );
    return response.data || [];
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!currentUserEmail && !!workspaceID,
  });

  return { sources: data, isLoading, error, refetch };
}
