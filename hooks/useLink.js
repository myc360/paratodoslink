import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const useLink = (linkId) => {
  const fetchLinks = async () => {
    const response = await axios.get(`/api/links/${linkId}`);
    return response.data;
  };

  return useQuery(['links', linkId], fetchLinks, {
    enabled: linkId !== null,
    onError: () => {
      toast.error('Ocorreu um erro');
    },
    // refetchInterval: 2000,
  });
};

export default useLink;
