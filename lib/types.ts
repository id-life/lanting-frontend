import { CHAPTERS } from "./constants";

export type Chapter = (typeof CHAPTERS)[number] | "随园食单" | string;

export interface ChapterArchives {
  [key: Chapter]: number[]; // article IDs
}

export interface FieldFreqMap {
  author: Record<string, number>;
  publisher: Record<string, number>;
  date: Record<string, number>;
  tag: Record<string, number>;
}

// --- UPDATED Archive Type ---
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
}

export interface Archives {
  archives: Record<number, Archive>;
  fieldFreqMap: FieldFreqMap;
}

export interface ArchiveListContentType {
  archive: Archive;
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
  likesMap: LikesMap;
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

// Comment-related types
export interface CommentData {
  id: string;
  articleId: string;
  content: string;
  author?: string;
  timestamp: number;
}

export interface NewCommentPayload {
  articleId: string;
  content: string;
  author?: string;
}

// Tribute page related types
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

// For dynamic routes like /archive/[id]
export interface ArchivePageParams {
  id: string;
}

// Specific type for response when POSTing likes, if backend returns all likes
export interface LikesUpdateResponse {
  likes: LikesMap;
  // articleId?: string;
  // currentLikes?: number;
}
export interface SearchKeywordUpdateResponse {
  keywords: { [keyword: string]: number };
  // keyword?: string;
  // currentCount?: number;
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
}

// --- UPDATE Tribute API Response Types ---
export interface TributeInfoResponseData extends LinkPreviewData {}

export interface TributeExtractHtmlResponseData extends LinkPreviewData {}

export interface TributeSaveResponseData extends Archive {}
