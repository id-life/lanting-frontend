export const CHAPTERS = [
  "本纪",
  "世家",
  "搜神",
  "列传",
  "游侠",
  "群像",
] as const;

export type Chapter = (typeof CHAPTERS)[number]; // 更精确的类型

// ChapterArchives 保持键为字符串类型，因为它们是通过变量访问的
export interface ChapterArchives {
  [key: string]: number[]; // 存储的是 archiveId
  本纪: number[];
  世家: number[];
  搜神: number[];
  列传: number[];
  游侠: number[];
  群像: number[];
}

export interface FieldFreqMap {
  author: Record<string, number>;
  publisher: Record<string, number>;
  date: Record<string, number>;
  tag: Record<string, number>;
}

export interface Archive {
  id: string; // 通常 id 是字符串或数字，这里保持字符串与原定义一致
  title: string;
  author: string[];
  publisher: string;
  date: string;
  chapter: Chapter;
  tag: string[];
  remarks: string; // Markdown content
  origs: string[] | false; // 保持原样，可以是文件名数组或false
  likes: number;
}

export interface Archives {
  archives: Record<number, Archive>; // 键是数字ID
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
  updatedAt: number; // 可以是时间戳
}

// 新增：评论相关类型
export interface CommentData {
  id: string; // 评论自身的ID
  articleId: string; // 关联的文章ID
  content: string;
  author?: string; // 评论者，可选
  timestamp: number; // 时间戳
}

export interface NewCommentData {
  articleId: string;
  content: string;
  author?: string;
}

// 新增：投稿页相关类型
export interface TributeFormState {
  link: string;
  title: string;
  author: string;
  publisher: string;
  date: string;
  chapter: string;
  tag: string;
  remarks: string;
  [key: string]: string; // 允许额外属性
}

export type TributeFormData = Omit<TributeFormState, "file"> & { file?: File };

export interface LinkInfo {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  date?: string | null; // 可能为YYYY-MM-DD 或 YYYY-MM
  summary?: string | null;
  keywords?: {
    predefined: string[];
    extracted: string[];
  } | null;
  fullDate?: string | null; // 更精确的日期，可选
}

export interface LinkInfoResponse {
  status: "success" | "fail";
  code?: string;
  data?: LinkInfo;
  message?: string;
}

// 新增：全局状态类型（如果使用Context或Zustand等）
// 这是一个简化的例子，具体取决于你选择的状态管理方案
export interface GlobalState {
  compiledArchives: Archives | null;
  currentArchives: ChapterArchives | null; // 过滤后的数据
  filters: FilterValues | null;
  searchKeywords: SearchList[];
  likesMap: Record<string, number>; // 文章ID -> 点赞数
  // 其他需要的全局状态...
}

// 如果使用ProLayout，可以保留这个
export interface ConnectState {
  global: { collapsed: boolean }; // 示例
  settings: any; // ProLayout 的 Settings 类型
  loading: {
    models: Record<string, boolean>;
    effects: Record<string, boolean>;
  };
  // 根据实际使用的model添加更多...
  lanting?: GlobalState; // 假设兰亭页面的状态放在这里
  archivePage?: {
    // 存档详情页的状态
    comments: CommentData[];
    isLoadingComments: boolean;
    isSubmittingComment: boolean;
  };
}
