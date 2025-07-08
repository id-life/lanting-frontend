/* eslint-disable @typescript-eslint/no-explicit-any */
import request from './request';
import type {
  Archive,
  CommentData,
  LikeUpdateResponse,
  NewCommentPayload,
  UpdateArchivePayload,
  TributeInfoResponseData,
  TributeExtractHtmlResponseData,
  SuccessResponse,
} from '@/lib/types';

interface ArchivesResponse {
  data: Archive[];
  count: number;
}

// --- Archives ---

export const fetchArchives = async (): Promise<ArchivesResponse> => {
  return request.get<any, ArchivesResponse>('/archives');
};

export interface ArchiveResponse {
  data: Archive;
  success: boolean;
}
export const fetchArchiveById = async (id: string | number): Promise<ArchiveResponse> => {
  return request.get<any, ArchiveResponse>(`/archives/${id}`);
};

export const createArchive = async (payload: FormData): Promise<Archive> => {
  return request.post<any, Archive>('/archives', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateArchive = async (id: string | number, payload: UpdateArchivePayload): Promise<Archive> => {
  return request.post<any, Archive>(`/archives/${id}`, payload);
};

export const deleteArchive = async (id: string | number): Promise<void> => {
  return request.delete<any, void>(`/archives/${id}`);
};

export const fetchChapters = async (): Promise<string[]> => {
  return request.get<any, string[]>('/archives/chapters');
};

// --- Tribute APIs ---

export const fetchTributeInfoByLink = async (link: string): Promise<SuccessResponse<TributeInfoResponseData>> => {
  return request.get<any, SuccessResponse<TributeInfoResponseData>>(`/tribute/info?link=${encodeURIComponent(link)}`);
};
export const postTributeExtractHtml = async (formData: FormData): Promise<SuccessResponse<TributeExtractHtmlResponseData>> => {
  return request.post('/tribute/extract-html', formData);
};

// --- Likes & Comments ---

// POST /api/archives/{id}/like
export const postLike = async (payload: {
  archiveId: string | number;
  liked: boolean;
}): Promise<SuccessResponse<LikeUpdateResponse>> => {
  const { archiveId, liked } = payload;
  return request.post(`/archives/${archiveId}/like`, { liked });
};

// GET /api/archives/{id}/comments
export const fetchComments = async (archiveId: string): Promise<SuccessResponse<CommentData[]>> => {
  return request.get(`/archives/${archiveId}/comments`);
};

// POST /api/archives/{id}/comments
export const postComment = async (payload: NewCommentPayload): Promise<SuccessResponse<CommentData>> => {
  const { articleId, ...body } = payload;
  return request.post(`/archives/${articleId}/comments`, body);
};
