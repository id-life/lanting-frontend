export type Chapter =
  | "本纪"
  | "世家"
  | "搜神"
  | "列传"
  | "游侠"
  | "群像"
  | "随园食单"
  | string;

export interface ChapterArchives {
  [key: Chapter]: number[];
}

export interface FieldFreqMap {
  author: { [key: string]: number };
  publisher: { [key: string]: number };
  date: { [key: string]: number };
  tag: { [key: string]: number };
}

export interface Archive {
  id: number; // 改为 number 类型与 archives.json 一致
  title: string;
  author: string[];
  publisher: string;
  date: string;
  chapter: Chapter;
  tag: string[];
  remarks: string;
  origs: string[] | false; // archives.json 中是字符串数组
  likes: number;
}

export interface Archives {
  archives: {
    [key: number]: Archive; // 键是数字 ID
  };
  fieldFreqMap: FieldFreqMap;
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
  [articleId: string]: number; // 或 number，取决于 API 返回
}

export interface CommentAuthor {
  // Optional: if you want richer author info
  name: string;
  avatar?: string;
}

export interface CommentData {
  id: string; // Unique ID for the comment
  articleId: string; // ID of the article it belongs to
  content: string;
  author?: string; // Simplified: just author name, or use CommentAuthor for richer data
  timestamp: number; // Unix timestamp
  // Add any other fields like replies if needed in the future
}

// For the page props
export interface ArchivePageParams {
  id: string;
}

export interface TributeFormState {
  link: string;
  title: string;
  author: string;
  publisher: string;
  date: string;
  chapter: string; // Should match one of the predefined chapters
  tag: string; // Comma-separated string
  remarks: string;
  // file field is handled by Upload component's state, not directly here
}

export interface LinkPreviewData {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  date?: string | null; // Or a more specific date string/object
  summary?: string | null;
  keywords?: {
    predefined: string[];
    extracted: string[];
  } | null;
}

// This was in Umi's Tribute model, but seems generic. We can reuse if needed.
export interface LoginStateType {
  // Renamed from StateType to avoid conflict
  status?: "ok" | "error";
  type?: string;
  currentAuthority?: "user" | "guest" | "admin";
}
