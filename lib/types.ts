import { CHAPTERS } from './constants';

export type Chapter = (typeof CHAPTERS)[number] | '随园食单' | string;

export interface ChapterArchives {
  [key: Chapter]: number[];
}

export interface FieldFreqMap {
  author: Record<string, number>;
  publisher: Record<string, number>;
  date: Record<string, number>;
  tag: Record<string, number>;
}
export interface Archive {
  id: number;
  title: string;
  author: string | null;
  publisher: string | null;
  date: string | null;
  chapter: Chapter | null;
  tag: string[];
  remarks: string | null;
  originalUrl: string | null;
  archiveFilename: string | null;
  fileType: string | null;
  createdAt: string;
  updatedAt: string;
  likes: number;
}

export interface Archives {
  archives: Record<number, Archive>;
  fieldFreqMap: FieldFreqMap;
}

export interface ArchiveListContentType {
  archive: Archive;
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
}

export interface ArchiveChapterType extends ArchiveListContentType {
  chapter: string;
  compiledArchives: Archives;
}

export interface FilterValues {
  search: string;
  confirmSearch: string;
  author: string[];
  date: string[];
  publisher: string[];
  tag: string[];
  likesMin: number;
  likesMax: number;
}

export interface SearchList {
  keyword: string;
  count: number;
  updatedAt: number;
}

export interface LikesMap {
  [articleId: string]: number;
}
export interface CommentData {
  id: number;
  archiveId: number;
  content: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewCommentPayload {
  articleId: string;
  content: string;
  nickname?: string;
}
export interface TributeFormState {
  link: string;
  title: string;
  author: string;
  publisher: string;
  date: string;
  chapter: string;
  tag: string;
  remarks: string;
  [key: string]: string;
}

export interface LinkPreviewData {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  date?: string | null;
  summary?: string | null;
  keywords?: {
    predefined: string[];
    extracted: string[];
  } | null;
}

export interface ArchivePageParams {
  id: string;
}
export interface LikeUpdateResponse {
  id: number;
  likes: number;
}
export interface SearchKeywordUpdateResponse {
  keywords: { [keyword: string]: number };
}

export interface UpdateArchivePayload {
  title?: string;
  author?: string;
  publisher?: string;
  date?: string;
  chapter?: string;
  tag?: string[];
  remarks?: string;
  originalUrl?: string;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface TributeInfoResponseData extends LinkPreviewData {}

export interface TributeExtractHtmlResponseData extends LinkPreviewData {}

export interface TributeSaveResponseData extends Archive {}
