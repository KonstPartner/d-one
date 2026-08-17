import type { DiaryEntry } from './diaryEntry';

type DiaryPagination = {
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
