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

export interface UpdateLikeParams {
  articleId: string | number;
  like: boolean;
}

// --- Comments API Types ---
export interface FetchCommentsParams {
  articleId: string | number;
}

export type CreateCommentParams = CreateCommentPayload;

// --- Search Keywords API Types ---
export interface SearchKeywordsData {
  keywords: { [keyword: string]: number };
  [key: string]: any;
}

export interface SaveSearchKeywordParams {
  keyword: string;
}

// --- Tribute API Types ---
export interface FetchLinkInfoParams {
  link: string;
}

export interface ExtractHtmlParams {
  htmlFile: File;
}

export type SaveTributeParams = TributeFormState | FormData;
export interface SavedTributeData {
  id: string | number;
  [key: string]: any;
}
