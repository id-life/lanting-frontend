/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, postComment } from "@/apis";
import type { CommentData, NewCommentPayload } from "@/lib/types";
import { ApiResponse } from "@/apis/request";

export const useFetchComments = (articleId: string | undefined) =>
  useQuery<ApiResponse<{ comments: CommentData[] }>, Error, CommentData[]>({
    queryKey: ["comments", articleId],
    queryFn: () => {
      if (!articleId) {
        return Promise.resolve({
          code: 200,
          message: "No ID",
          data: { comments: [] },
        });
      }
      return fetchComments(articleId);
    },
    select: (response) => response.data.comments,
    enabled: !!articleId,
  });

export const useSubmitComment = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, NewCommentPayload>({
    mutationFn: postComment,
    onSuccess: (response, variables) => {
      if (response.code === 200) {
        queryClient.invalidateQueries({
          queryKey: ["comments", variables.articleId],
        });
      }
    },
  });
};
