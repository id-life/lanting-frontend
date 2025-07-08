/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, postComment } from '@/apis';
import type { CommentData, NewCommentPayload, SuccessResponse } from '@/lib/types';

export const useFetchComments = (articleId: string | undefined) =>
  useQuery<SuccessResponse<CommentData[]>, Error, CommentData[]>({
    queryKey: ['comments', articleId],
    queryFn: () => {
      if (!articleId) {
        return Promise.resolve({
          success: true,
          data: [],
          message: 'No ID',
        });
      }
      return fetchComments(articleId);
    },
    select: (response) => (response.success ? response.data : []),
    enabled: !!articleId,
  });

export const useSubmitComment = () => {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse<CommentData>, Error, NewCommentPayload, { previousComments?: CommentData[] }>({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: ['comments', newComment.articleId],
      });

      const previousComments = queryClient.getQueryData<CommentData[]>(['comments', newComment.articleId]);

      queryClient.setQueryData<CommentData[]>(['comments', newComment.articleId], (old) => {
        const optimisticComment: CommentData = {
          id: -Date.now(),
          archiveId: Number(newComment.articleId),
          content: newComment.content,
          nickname: newComment.nickname || '匿名用户',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return old ? [optimisticComment, ...old] : [optimisticComment];
      });

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', newComment.articleId], context.previousComments);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.articleId],
      });
    },
  });
};
