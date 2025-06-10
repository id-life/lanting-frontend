/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLikes, postLike } from "@/apis";
import type { LikesMap } from "@/lib/types";
import { ApiResponse } from "@/apis/request";

export const useFetchLikes = (articleId?: string) =>
  useQuery<ApiResponse<LikesMap>, Error, LikesMap>({
    queryKey: ["likes", articleId || "all"],
    queryFn: () => fetchLikes(articleId),
    select: (response) => response.data,
  });

export const useUpdateLike = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { articleId: string; like: boolean },
    { previousLikes?: LikesMap }
  >({
    mutationFn: postLike,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["likes", variables.articleId],
      });
      await queryClient.cancelQueries({ queryKey: ["likes", "all"] });
      await queryClient.cancelQueries({ queryKey: ["archivesList"] });
      await queryClient.cancelQueries({
        queryKey: ["archive", variables.articleId],
      });
      const previousLikesForArticle = queryClient.getQueryData<LikesMap>([
        "likes",
        variables.articleId,
      ]);
      const previousAllLikes = queryClient.getQueryData<LikesMap>([
        "likes",
        "all",
      ]);
      const optimisticUpdate = (
        currentLikes: number | undefined,
        isLike: boolean
      ) => {
        const baseLikes = currentLikes || 0;
        return isLike ? baseLikes + 1 : Math.max(0, baseLikes - 1);
      };
      if (previousLikesForArticle) {
        queryClient.setQueryData<LikesMap>(
          ["likes", variables.articleId],
          (old) => ({
            ...old,
            [variables.articleId]: optimisticUpdate(
              old?.[variables.articleId],
              variables.like
            ),
          })
        );
      }
      if (previousAllLikes) {
        queryClient.setQueryData<LikesMap>(["likes", "all"], (old) => ({
          ...old,
          [variables.articleId]: optimisticUpdate(
            old?.[variables.articleId],
            variables.like
          ),
        }));
      }
      return { previousLikes: previousAllLikes || previousLikesForArticle };
    },
    onError: (err, variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(
          ["likes", variables.articleId],
          context.previousLikes
        );
        queryClient.setQueryData(["likes", "all"], context.previousLikes);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["likes", variables.articleId],
      });
      queryClient.invalidateQueries({ queryKey: ["likes", "all"] });
      queryClient.invalidateQueries({ queryKey: ["archivesList"] });
      queryClient.invalidateQueries({
        queryKey: ["archive", variables.articleId],
      });
    },
  });
};
