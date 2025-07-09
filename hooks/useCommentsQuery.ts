import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, postComment } from '@/apis';
import { ArchiveComment, CreateCommentParams, CreateCommentResponse, FetchCommentsResponse } from '@/apis/types';

export const useFetchComments = (articleId: string | undefined) =>
  useQuery<FetchCommentsResponse, Error, ArchiveComment[]>({
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
  return useMutation<CreateCommentResponse, Error, CreateCommentParams, { previousCommentsResponse?: FetchCommentsResponse }>({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: ['comments', newComment.articleId],
      });

      const commentsResponse = queryClient.getQueryData<FetchCommentsResponse>(['comments', newComment.articleId]);

      queryClient.setQueryData<FetchCommentsResponse>(['comments', newComment.articleId], (old) => {
        const optimisticComment: ArchiveComment = {
          id: -Date.now(),
          archiveId: Number(newComment.articleId),
          content: newComment.content,
          nickname: newComment.nickname || '匿名用户',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (!old) {
          old = {
            success: true,
            data: [],
            message: 'Initial data',
          };
        }

        old.data = old?.data ? [optimisticComment, ...old?.data] : [optimisticComment];

        return old;
      });

      return { previousCommentsResponse: commentsResponse };
    },
    onError: (err, newComment, context) => {
      if (context?.previousCommentsResponse) {
        queryClient.setQueryData(['comments', newComment.articleId], context.previousCommentsResponse);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.articleId],
      });
    },
  });
};
