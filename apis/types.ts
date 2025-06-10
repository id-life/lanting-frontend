/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CommentData as CreateCommentPayload,
  TributeFormState,
} from "@/lib/types";

// --- Archives API Types ---

export interface FetchSingleArchiveParams {
  id: string | number;
}

// --- Likes API Types ---
export interface FetchLikesParams {
  articleId?: string | number;
}
// fetchLikes 的 data 部分是 LikesMap (或者包含 LikesMap 的对象)
// updateLike 的 data 部分通常是更新后的 LikesMap 或成功消息

export interface UpdateLikeParams {
  articleId: string | number;
  like: boolean;
}

// --- Comments API Types ---
export interface FetchCommentsParams {
  articleId: string | number;
}
// fetchComments 的 data 部分是 CommentData[]

export type CreateCommentParams = CreateCommentPayload;
// createComment 的 data 部分可能是 CommentData (新评论), CommentData[] (所有评论), 或成功消息

// --- Search Keywords API Types ---
export interface SearchKeywordsData {
  // data 部分的结构
  keywords: { [keyword: string]: number };
  [key: string]: any;
}

export interface SaveSearchKeywordParams {
  keyword: string;
}
// saveSearchKeyword 的 data 部分可能是更新后的 SearchKeywordsData 或成功消息

// --- Tribute API Types ---
export interface FetchLinkInfoParams {
  link: string;
}
// fetchLinkInfo 的 data 部分是 LinkPreviewData (或包含它的对象)

export interface ExtractHtmlParams {
  htmlFile: File;
}
// extractHtmlInfo 的 data 部分是 LinkPreviewData (或包含它的对象)

export type SaveTributeParams = TributeFormState | FormData;
// saveTribute 的 data 部分可能是 { id: string | number } (新文章ID) 或成功消息
export interface SavedTributeData {
  id: string | number;
  [key: string]: any;
}
