import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTributeInfoByLink,
  postTributeExtractHtml,
  createArchive,
} from "@/apis";
import type {
  Archive,
  TributeInfoResponseData,
  TributeExtractHtmlResponseData,
  SuccessResponse,
} from "@/lib/types";

export const useFetchTributeInfo = (
  link: string | null,
  options?: { enabled?: boolean }
) =>
  useQuery<
    SuccessResponse<TributeInfoResponseData>,
    Error,
    TributeInfoResponseData | null
  >({
    queryKey: ["tributeInfo", link],
    queryFn: () => fetchTributeInfoByLink(link!),
    select: (response) => (response.success ? response.data : null),
    enabled:
      !!link && (options?.enabled !== undefined ? options.enabled : true),
    retry: false,
  });

export const useExtractHtmlInfo = () => {
  return useMutation<TributeExtractHtmlResponseData, Error, FormData>({
    mutationFn: postTributeExtractHtml,
  });
};

export const useCreateArchive = () => {
  const queryClient = useQueryClient();
  return useMutation<Archive, Error, FormData>({
    mutationFn: createArchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivesList"] });
    },
  });
};
