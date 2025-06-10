/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { ApiResponse } from "./request";
import type {
  Archive,
  CommentData,
  LikesMap,
  LikesUpdateResponse,
  NewCommentPayload,
  SearchKeywordUpdateResponse,
  UpdateArchivePayload,
  TributeInfoResponseData,
  TributeExtractHtmlResponseData,
  SuccessResponse,
} from "@/lib/types";

interface ArchivesResponse {
  data: Archive[];
  count: number;
}

// --- Archives ---

export const fetchArchives = async (): Promise<ArchivesResponse> => {
  return request.get<any, ArchivesResponse>("/archives");
};

export interface ArchiveResponse {
  data: Archive;
  success: boolean;
}
export const fetchArchiveById = async (
  id: string | number
): Promise<ArchiveResponse> => {
  return request.get<any, ArchiveResponse>(`/archives/${id}`);
};

export const createArchive = async (payload: FormData): Promise<Archive> => {
  return request.post<any, Archive>("/archives", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateArchive = async (
  id: string | number,
  payload: UpdateArchivePayload
): Promise<Archive> => {
  return request.post<any, Archive>(`/archives/${id}`, payload);
};

export const deleteArchive = async (id: string | number): Promise<void> => {
  return request.delete<any, void>(`/archives/${id}`);
};

export const fetchChapters = async (): Promise<string[]> => {
  return request.get<any, string[]>("/archives/chapters");
};

// --- Tribute APIs ---

export const fetchTributeInfoByLink = async (
  link: string
): Promise<SuccessResponse<TributeInfoResponseData>> => {
  return request.get<any, SuccessResponse<TributeInfoResponseData>>(
    `/tribute/info?link=${encodeURIComponent(link)}`
  );
};
export const postTributeExtractHtml = async (
  formData: FormData
): Promise<TributeExtractHtmlResponseData> => {
  return request.post<any, TributeExtractHtmlResponseData>(
    "/tribute/extract-html",
    formData
  );
};

// --- Likes, Comments, Keywords ---

const createDefaultResponse = <T>(
  defaultData: T,
  message: string = "Default data"
): ApiResponse<T> => ({
  code: 200,
  message,
  data: defaultData,
});

// GET /api/likes/read?articleId=xxx
export const fetchLikes = async (
  articleId?: string
): Promise<ApiResponse<LikesMap>> => {
  const endpoint = articleId
    ? `/likes/read?articleId=${articleId}`
    : "/likes/read";
  try {
    return await request.get<any, ApiResponse<LikesMap>>(endpoint);
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn(`Likes API not found. Returning default empty map.`);
      return createDefaultResponse<LikesMap>({});
    }
    throw error;
  }
};

// GET /api/search-keyword/read
export const fetchSearchKeywords = async (): Promise<
  ApiResponse<{ keywords: Record<string, number> }>
> => {
  try {
    return await request.get<
      any,
      ApiResponse<{ keywords: Record<string, number> }>
    >("/search-keyword/read");
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn(
        "Search Keywords API not found. Returning default empty object."
      );
      return createDefaultResponse<{ keywords: Record<string, number> }>({
        keywords: {},
      });
    }
    throw error;
  }
};

// GET /api/comments/read?articleId=xxx
export const fetchComments = async (
  articleId: string
): Promise<ApiResponse<{ comments: CommentData[] }>> => {
  try {
    return await request.get<any, ApiResponse<{ comments: CommentData[] }>>(
      `/comments/read?articleId=${articleId}`
    );
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn(
        `Comments API not found for article ${articleId}. Returning default empty array.`
      );
      return createDefaultResponse<{ comments: CommentData[] }>({
        comments: [],
      });
    }
    throw error;
  }
};

// --- Mutations ---
export const postLike = async (payload: {
  articleId: string;
  like: boolean;
}): Promise<ApiResponse<LikesUpdateResponse>> => {
  return request.post("/likes/create", payload);
};

export const postSearchKeyword = async (
  keyword: string
): Promise<ApiResponse<SearchKeywordUpdateResponse>> => {
  return request.post("/search-keyword/create", keyword, {
    headers: { "Content-Type": "text/plain" },
  });
};

export const postComment = async (
  payload: NewCommentPayload
): Promise<ApiResponse<{ allComments: CommentData[] }>> => {
  return request.post("/comments/create", payload);
};
