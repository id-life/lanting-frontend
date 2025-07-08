/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postLike } from '@/apis';
import type { Archive, Archives, SuccessResponse, LikeUpdateResponse } from '@/lib/types';

export const useUpdateLike = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SuccessResponse<LikeUpdateResponse>,
    Error,
    { articleId: string; like: boolean },
    { previousArchives?: Archives; previousArchive?: Archive }
  >({
    mutationFn: (variables) => postLike({ archiveId: variables.articleId, liked: variables.like }),

    onMutate: async ({ articleId, like }) => {
      await queryClient.cancelQueries({ queryKey: ['archivesList'] });
      await queryClient.cancelQueries({ queryKey: ['archive', articleId] });

      const previousArchives = queryClient.getQueryData<Archives>(['archivesList']);
      const previousArchive = queryClient.getQueryData<Archive>(['archive', articleId]);

      const aId = Number(articleId);

      if (previousArchives) {
        queryClient.setQueryData<Archives>(['archivesList'], (old) => {
          if (!old) return old;
          const newArchives = { ...old.archives };
          const archiveToUpdate = newArchives[aId];
          if (archiveToUpdate) {
            newArchives[aId] = {
              ...archiveToUpdate,
              likes: archiveToUpdate.likes + (like ? 1 : -1),
            };
          }
          return { ...old, archives: newArchives };
        });
      }

      if (previousArchive) {
        queryClient.setQueryData<Archive>(['archive', articleId], (old) => {
          if (!old) return old;
          return { ...old, likes: old.likes + (like ? 1 : -1) };
        });
      }

      return { previousArchives, previousArchive };
    },

    onError: (err, variables, context) => {
      if (context?.previousArchives) {
        queryClient.setQueryData(['archivesList'], context.previousArchives);
      }
      if (context?.previousArchive) {
        queryClient.setQueryData(['archive', variables.articleId], context.previousArchive);
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['archivesList'] });
      queryClient.invalidateQueries({
        queryKey: ['archive', variables.articleId],
      });
    },
  });
};
