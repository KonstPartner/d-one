import type { CloudDiaryEntry } from './cloudDiaryEntry';

export const CLOUD_DIARY_PAGE_SIZE = 30;

export const CLOUD_DIARY_QUERY_LIMIT = CLOUD_DIARY_PAGE_SIZE + 1;

export type CloudDiaryCursor = {
  eventAtMs: number;
  id: string;
};

export type CloudDiaryPageInfo = {
  hasNextPage: boolean;
  nextCursor: CloudDiaryCursor | null;
};

export type CloudDiaryPageResult = {
  items: CloudDiaryEntry[];
  pageInfo: CloudDiaryPageInfo;
};
