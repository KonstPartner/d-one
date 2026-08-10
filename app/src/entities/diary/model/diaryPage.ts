import type { DiaryEntry } from './diaryEntry';

export type DiaryPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type DiaryPageResult = {
  items: DiaryEntry[];
  pagination: DiaryPagination;
};
