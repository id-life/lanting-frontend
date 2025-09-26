import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTributeInfoByLink, postTributeExtractHtml, createArchive, updateArchive } from '@/apis';
import {
  CreateArchiveResponse,
  ExtractHtmlResponse,
  GetTributeInfoResponse,
  TributeInfo,
  UpdateArchiveResponse,
} from '@/apis/types';
import { useAuthToken } from './useAuthToken';

export const useFetchTributeInfo = (link: string | null, options?: { enabled?: boolean }) => {
  const { authToken } = useAuthToken();

  return useQuery<GetTributeInfoResponse, Error, TributeInfo | null>({
    queryKey: ['tributeInfo', link],
    queryFn: () => fetchTributeInfoByLink(link!),
    select: (response) => (response.success ? response.data : null),
    enabled: !!authToken && !!link && (options?.enabled !== undefined ? options.enabled : true),
    retry: false,
  });
};

export const useExtractHtmlInfo = () => {
  const { authToken } = useAuthToken();

  return useMutation<ExtractHtmlResponse, Error, FormData>({
    mutationFn: (formData) => {
      if (!authToken) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return postTributeExtractHtml(formData);
    },
  });
};

export const useCreateArchive = () => {
  const queryClient = useQueryClient();
  const { authToken } = useAuthToken();

  return useMutation<CreateArchiveResponse, Error, FormData>({
    mutationFn: (formData) => {
      if (!authToken) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return createArchive(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivesList'] });
    },
  });
};

export const useUpdateArchive = () => {
  const queryClient = useQueryClient();
  const { authToken } = useAuthToken();

  return useMutation<UpdateArchiveResponse, Error, { id: string | number; formData: FormData }>({
    mutationFn: ({ id, formData }) => {
      if (!authToken) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return updateArchive(id, formData);
    },
    onSuccess: (_, variables) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['archive', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['archivesList'] });
    },
  });
};
