import request from './request';
import {
  CreateArchiveResponse,
  CreateCommentParams,
  CreateCommentResponse,
  ExtractHtmlResponse,
  FetchCommentsResponse,
  FindAllArchivesResponse,
  FindOneArchiveResponse,
  GetSearchKeywordsResponse,
  GetTributeInfoResponse,
  LikeArchiveParams,
  LikeArchiveResponse,
  RecordSearchKeywordResponse,
  UpdateArchiveRequest,
  UpdateArchiveResponse,
} from './types';

// --- Archives ---

export const fetchArchives = async (): Promise<FindAllArchivesResponse> => {
  return request.get<any, FindAllArchivesResponse>('/archives');
};

export const fetchArchiveById = async (id: string | number): Promise<FindOneArchiveResponse> => {
  return request.get<any, FindOneArchiveResponse>(`/archives/${id}`);
};

export const createArchive = async (payload: FormData): Promise<CreateArchiveResponse> => {
  return request.post<any, CreateArchiveResponse>('/archives', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateArchive = async (id: string | number, payload: UpdateArchiveRequest): Promise<UpdateArchiveResponse> => {
  return request.patch<any, UpdateArchiveResponse>(`/archives/${id}`, payload);
};

export const deleteArchive = async (id: string | number): Promise<void> => {
  return request.delete<any, void>(`/archives/${id}`);
};

export const fetchChapters = async (): Promise<string[]> => {
  return request.get<any, string[]>('/archives/chapters');
};

// --- Tribute APIs ---

export const fetchTributeInfoByLink = async (link: string): Promise<GetTributeInfoResponse> => {
  return request.get<any, GetTributeInfoResponse>(`/tribute/info?link=${encodeURIComponent(link)}`);
};
export const postTributeExtractHtml = async (formData: FormData): Promise<ExtractHtmlResponse> => {
  return request.post('/tribute/extract-html', formData);
};

// --- Likes & Comments ---

// POST /api/archives/{id}/like
export const postLike = async (payload: LikeArchiveParams): Promise<LikeArchiveResponse> => {
  const { archiveId, liked } = payload;
  return request.post(`/archives/${archiveId}/like`, { liked });
};

// GET /api/archives/{id}/comments
export const fetchComments = async (archiveId: string): Promise<FetchCommentsResponse> => {
  return request.get(`/archives/${archiveId}/comments`);
};

// POST /api/archives/{id}/comments
export const postComment = async (payload: CreateCommentParams): Promise<CreateCommentResponse> => {
  const { articleId, ...body } = payload;
  return request.post(`/archives/${articleId}/comments`, body);
};

// GET /api/archives/search-keywords
export const fetchSearchKeywords = async (): Promise<GetSearchKeywordsResponse> => {
  return request.get('/archives/search-keywords');
};

// POST /api/archives/search-keywords
export const postSearchKeyword = async (keyword: string): Promise<RecordSearchKeywordResponse> => {
  return request.post('/archives/search-keywords', { keyword });
};
