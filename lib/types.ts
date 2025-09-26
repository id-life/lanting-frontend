import { Archive } from '@/apis/types';
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

export type TributeLinkMode = 'link' | 'upload' | 'pendingOrig';

export interface TributeLinkInput {
  link: string;
  mode: TributeLinkMode;
  pendingOrigId?: number | null;
}

export interface TributeFormState {
  links: TributeLinkInput[];
  title: string;
  authors: string;
  publisher: string;
  date: string;
  chapter: string;
  tags: string;
  remarks: string;
}

export interface ArchivePageParams {
  id: string;
}

export interface SearchKeywordUpdateResponse {
  keywords: { [keyword: string]: number };
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface TributeSaveResponseData extends Archive {}
