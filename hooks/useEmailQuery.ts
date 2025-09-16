import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmailWhitelist, postEmailWhitelist, deleteEmailWhitelist } from '@/apis';
import { GetEmailWhitelistResponse, EmailWhitelistItem } from '@/apis/types';
import { useAuthToken } from './useAuthToken';

export const useFetchEmailWhitelist = () => {
  const { authToken } = useAuthToken();

  return useQuery<GetEmailWhitelistResponse, Error, EmailWhitelistItem[]>({
    queryKey: ['emailWhitelist'],
    queryFn: getEmailWhitelist,
    select: (response) => (response.success ? response.data.emails : []),
    enabled: !!authToken,
  });
};

export const useAddEmailToWhitelist = () => {
  const queryClient = useQueryClient();
  const { authToken } = useAuthToken();

  return useMutation<GetEmailWhitelistResponse, Error, string>({
    mutationFn: (email) => {
      if (!authToken) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return postEmailWhitelist(email);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['emailWhitelist'] });
      }
    },
  });
};

export const useDeleteEmailFromWhitelist = () => {
  const queryClient = useQueryClient();
  const { authToken } = useAuthToken();

  return useMutation<GetEmailWhitelistResponse, Error, number>({
    mutationFn: (id) => {
      if (!authToken) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return deleteEmailWhitelist(id);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['emailWhitelist'] });
      }
    },
  });
};
