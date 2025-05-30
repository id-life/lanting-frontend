// Import the definitive CHAPTERS constant to derive the Chapter type
import { CHAPTERS as CHAPTER_NAMES } from "./constants";

// --- Core Chapter and Archive Types ---

/**
 * Defines the valid chapter names based on the CHAPTER_NAMES constant.
 */
export type Chapter = (typeof CHAPTER_NAMES)[number];

/**
 * Maps each defined Chapter to an array of archive IDs (numbers).
 */
export type ChapterArchives = {
  [K in Chapter]: number[];
};

/**
 * Describes the frequency map for various fields like author, publisher, etc.
 */
export interface FieldFreqMap {
  author: { [key: string]: number };
  publisher: { [key: string]: number };
  date: { [key: string]: number }; // Note: In fakeData.ts, this is often initialized empty.
  tag: { [key: string]: number };
}

/**
 * Represents a single archive entry.
 */
export interface Archive {
  id: number; // Standardized to number, parsed from original string IDs.
  title: string;
  author: string[];
  publisher: string;
  date: string; // Date string, e.g., "YYYY-MM-DD"
  chapter: Chapter; // Must be one of the defined Chapters.
  tag: string[];
  remarks: string; // Markdown content for the archive's description/summary.
  origs: string[] | false; // Array of original file names or false if none.
  likes: number;
}

/**
 * Represents the entire collection of archives and their field frequency maps.
 */
export interface Archives {
  archives: {
    [key: number]: Archive; // Archives are keyed by their numeric ID.
  };
  fieldFreqMap: FieldFreqMap;
}

// --- Filtering and Search ---

/**
 * Defines the structure for filter values used on the main page.
 */
export interface FilterValues {
  search: string; // Current input in the search bar
  confirmSearch: string; // Search term after user confirms (e.g., presses Enter)
  author: string[];
  date: string[];
  publisher: string[];
  tag: string[];
  likesMin: number;
  likesMax: number;
}

/**
 * Represents a search keyword item, including its count and last update time.
 */
export interface SearchList {
  keyword: string;
  count: number;
  updatedAt: number; // Timestamp of the last update.
}

// --- Likes ---

/**
 * Maps an article ID (number) to its like count.
 * Note: While API JSON keys are typically strings, JavaScript object access coerces numeric keys.
 * This type reflects the intended usage in the frontend state where keys are treated as numbers.
 * If an API returns string keys (e.g., "1001"), direct assignment to this type is permissible
 * in TypeScript if the context expects numeric keys, but an explicit transformation upon receiving
 * API data would be more robust for strict type checking.
 */
export interface LikesMap {
  [articleId: number]: number;
}

// --- Comments ---

/**
 * Represents a single comment.
 */
export interface CommentData {
  id: string; // The comment's unique ID.
  articleId: string; // The ID of the article this comment belongs to.
  content: string;
  author?: string; // Optional commenter name.
  timestamp: number; // Timestamp of when the comment was made.
}

/**
 * Structure for creating a new comment (typically for POST request body).
 */
export interface NewCommentData {
  articleId: string;
  content: string;
  author?: string;
}

// --- Page Params ---

/**
 * Defines the route parameters for an archive detail page.
 */
export interface ArchivePageParams {
  id: string; // The archive ID from the URL, typically a string.
}

// --- Tribute (Article Submission) Form ---

/**
 * State of the tribute form for submitting new articles.
 */
export interface TributeFormState {
  link: string;
  title: string;
  author: string; // Comma-separated string of authors from form input.
  publisher: string;
  date: string; // Date string from form input, e.g., "YYYY-MM-DD".
  chapter: Chapter; // Must be one of the defined Chapters.
  tag: string; // Comma-separated string of tags from form input.
  remarks: string;
}

/**
 * Data structure for the preview generated from a link or HTML file in the tribute form.
 */
export interface LinkPreviewData {
  title?: string | null;
  author?: string | null; // API might return string or string[], processed to string for form.
  publisher?: string | null;
  date?: string | null;
  summary?: string | null;
  keywords?: {
    predefined: string[];
    extracted: string[];
  } | null;
}

/**
 * Response structure when fetching link information for the tribute page.
 */
export interface LinkInfoResponse {
  status: "success" | "fail";
  code?: string; // Optional error or status code.
  data?: LinkPreviewData;
  message?: string; // Optional message, especially for errors.
}