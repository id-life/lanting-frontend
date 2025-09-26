// ============ 基础类型定义 ============

/**
 * 通用成功响应格式
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
}

/**
 * 通用错误响应格式
 */
export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
}

/**
 * 通用响应类型
 */
export type BaseResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ============ 实体类型定义 ============
/**
 * 作者实体
 */
export interface ArchiveAuthor {
  id: number;
  name: string;
}

/**
 * 出版方/来源 实体
 */
export interface ArchivePublisher {
  id: number;
  name: string;
}

/**
 * 日期实体
 */
export interface ArchiveDate {
  id: number;
  value: string;
}

/**
 * 标签实体
 */
export interface ArchiveTag {
  id: number;
  name: string;
}

/**
 * 原始文件实体
 */
export interface ArchiveOrig {
  id: number;
  originalUrl: string | null;
  storageUrl: string;
  fileType: string | null;
  storageType: string;
}

/**
 * 评论实体
 */
export interface ArchiveComment {
  id: number;
  nickname: string;
  content: string;
  archiveId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 搜索关键词实体
 */
export interface SearchKeyword {
  id: number;
  keyword: string;
  searchCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 归档实体
 */
export interface Archive {
  id: number;
  title: string;
  authors: ArchiveAuthor[];
  publisher: ArchivePublisher | null;
  date: ArchiveDate | null;
  chapter: string;
  tags: ArchiveTag[];
  remarks: string | null;
  origs: ArchiveOrig[];
  likes: number;
}

/**
 * 归档详情（包含评论信息）
 */
export interface ArchiveDetail extends Archive {
  commentsCount?: number;
  comments?: ArchiveComment[];
}

export interface EmailWhitelist {
  emails: EmailWhitelistItem[];
}

export interface EmailWhitelistItem {
  id: number;
  email: string;
}

export interface ArchivePendingOrig {
  id: number;
  storageUrl: string;
  fileType: string | null;
  status: string;
  senderEmail: string;
  messageId: string | null;
  subject: string | null;
  originalFilename: string;
}

// ============ Tribute 相关类型 ============

/**
 * 关键词对象
 */
export interface Keywords {
  predefined: string[];
  extracted: string[];
}

/**
 * Tribute 信息
 */
export interface TributeInfo {
  title?: string;
  author?: string;
  publisher?: string;
  date?: string;
  summary?: string;
  highlights?: TributeHighlight[];
  keywords?: Keywords;
}

export interface TributeHighlight {
  type: string;
  content: string;
  reason: string;
}

/**
 * HTML 提取结果
 */
export interface HtmlExtractResult {
  title?: string;
  author?: string;
  publisher?: string;
  date?: string;
  summary?: string;
  highlights?: TributeHighlight[];
  keywords: Keywords;
}

// ============ API 响应类型定义 ============

// Archives Controller 响应
export type CreateArchiveResponse = BaseResponse<Archive>;
export type FindAllArchivesResponse = BaseResponse<Archive[]>;
export type GetValidChaptersResponse = BaseResponse<string[]>;
export type FindOneArchiveResponse = BaseResponse<ArchiveDetail>;
export type UpdateArchiveResponse = BaseResponse<Archive>;
export type RemoveArchiveResponse = BaseResponse<null>;

/**
 * 点赞操作响应数据
 */
export interface LikeArchiveData {
  id: number;
  likes: number;
}
export type LikeArchiveResponse = BaseResponse<LikeArchiveData>;

export type GetArchiveContentResponse = string;

// 评论相关响应
export type CreateCommentResponse = BaseResponse<ArchiveComment>;

export type FetchCommentsResponse = BaseResponse<ArchiveComment[]>;

export type UpdateCommentResponse = BaseResponse<ArchiveComment>;

export type DeleteCommentResponse = BaseResponse<null>;

// 搜索关键词相关响应
export type RecordSearchKeywordResponse = BaseResponse<SearchKeyword>;
export type GetSearchKeywordsResponse = BaseResponse<SearchKeyword[]>;

// Tribute Controller 响应
export type GetTributeInfoResponse = BaseResponse<TributeInfo>;
export type ExtractHtmlResponse = BaseResponse<HtmlExtractResult>;

export type GetEmailWhitelistResponse = BaseResponse<EmailWhitelist>;

export type GetArchivePendingOrigsResponse = BaseResponse<ArchivePendingOrig[]>;

// ============ 请求体类型（客户端） ============

/**
 * 创建归档请求体
 */
export interface CreateArchiveRequest {
  title: string;
  authors?: string[];
  publisher?: string;
  date?: string;
  chapter: string;
  tag?: string[];
  remarks?: string;
  originalUrl?: string;
}

/**
 * 更新归档请求体
 */
export interface UpdateArchiveRequest extends Partial<CreateArchiveRequest> {}

/**
 * 创建评论请求体
 */
export interface CreateCommentRequest {
  nickname: string;
  content: string;
}

export type CreateCommentParams = Omit<CreateCommentRequest, 'nickname'> & {
  articleId: number | string;
  nickname?: string;
};

/**
 * 更新评论请求体
 */
export interface UpdateCommentRequest extends Partial<CreateCommentRequest> {}

/**
 * 点赞请求体
 */
export interface LikeArchiveRequest {
  liked: boolean;
}

export interface LikeArchiveParams extends LikeArchiveRequest {
  archiveId: string;
}
/**
 * 搜索关键词请求体
 */
export interface SearchKeywordRequest {
  keyword: string;
}
