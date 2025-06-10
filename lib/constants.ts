import { FilterValues, TributeFormState } from "./types";

export const CHAPTERS = [
  "本纪",
  "世家",
  "搜神",
  "列传",
  "游侠",
  "群像",
] as const;

export const DEFAULT_FILTER_VALUES: FilterValues = {
  search: "",
  confirmSearch: "",
  author: ["all"],
  date: ["all"],
  publisher: ["all"],
  tag: ["all"],
  likesMin: 0,
  likesMax: 255,
};

export const TRIBUTE_CHAPTERS = [
  "本纪",
  "世家",
  "搜神",
  "列传",
  "游侠",
  "群像",
] as const;

export const INITIAL_TRIBUTE_STATE: TributeFormState = {
  link: "",
  title: "",
  author: "",
  publisher: "",
  date: "",
  chapter: "本纪",
  tag: "",
  remarks: "",
};
