import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSearchKeywords, postSearchKeyword } from '@/apis';
import { GetSearchKeywordsResponse, RecordSearchKeywordResponse, SearchKeyword } from '@/apis/types';

export const useFetchSearchKeywords = () =>
  useQuery<GetSearchKeywordsResponse, Error, SearchKeyword[]>({
    queryKey: ['searchKeywords'],
    queryFn: fetchSearchKeywords,
    select: (response) => (response.success ? response.data : []),
  });

export const useAddSearchKeyword = () => {
  const queryClient = useQueryClient();
  return useMutation<RecordSearchKeywordResponse, Error, string>({
    mutationFn: postSearchKeyword,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['searchKeywords'] });
      }
    },
  });
};
