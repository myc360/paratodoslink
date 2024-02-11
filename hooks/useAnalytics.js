import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const useAnalytics = (filter, handle) => {
  return useQuery({
    queryKey: ['analytics', handle, filter],
    queryFn: async () => {
      const response = await axios.get(
        `/api/analytics/views?handle=${handle}&filter=${filter}`
      );
      return response.data;
    },
    enabled: !!handle,
    onError: () => {
      toast.error('Ocorreu um erro');
    },
    // refetchInterval: 2000,
  });
};

export default useAnalytics;
