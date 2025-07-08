import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTributeInfoByLink, postTributeExtractHtml, createArchive } from '@/apis';
import { CreateArchiveResponse, ExtractHtmlResponse, GetTributeInfoResponse, TributeInfo } from '@/apis/types';

export const useFetchTributeInfo = (link: string | null, options?: { enabled?: boolean }) =>
  useQuery<GetTributeInfoResponse, Error, TributeInfo | null>({
    queryKey: ['tributeInfo', link],
    queryFn: () => fetchTributeInfoByLink(link!),
    select: (response) => (response.success ? response.data : null),
    enabled: !!link && (options?.enabled !== undefined ? options.enabled : true),
    retry: false,
  });

export const useExtractHtmlInfo = () => {
  return useMutation<ExtractHtmlResponse, Error, FormData>({
    mutationFn: postTributeExtractHtml,
  });
};

export const useCreateArchive = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateArchiveResponse, Error, FormData>({
    mutationFn: createArchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivesList'] });
    },
  });
};
