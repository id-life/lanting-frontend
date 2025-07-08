/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSearchKeywords, postSearchKeyword } from '@/apis';
import { ApiResponse } from '@/apis/request';

export const useFetchSearchKeywords = () =>
  useQuery<ApiResponse<{ keywords: Record<string, number> }>, Error, Record<string, number>>({
    queryKey: ['searchKeywords'],
    queryFn: fetchSearchKeywords,
    select: (response) => response.data.keywords,
  });

export const useAddSearchKeyword = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: postSearchKeyword,
    onSuccess: (response) => {
      if (response.code === 200) {
        queryClient.invalidateQueries({ queryKey: ['searchKeywords'] });
      }
    },
  });
};
