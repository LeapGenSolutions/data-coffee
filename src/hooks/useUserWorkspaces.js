import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

export function useUserWorkspaces(email) {
    return useQuery({
        queryKey: ['workspaces', email],
        queryFn: async () => {
            if (!email) return [];
            const res = await axios.get(`${BACKEND_URL}/api/workspaces/owner/${encodeURIComponent(email)}`);
            return Array.isArray(res.data) ? res.data : [res.data];
        }
    });
}
