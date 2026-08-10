import {
  type DiaryFilters,
  toDiaryEntryFilterCriteria,
} from '@features/filter-diary-entries';
import type { DiaryEntryQuery, DiaryEntrySearch } from '@entities/diary';

type CreateOwnerDiaryQueryOptions = {
  search: DiaryEntrySearch;
  filters: DiaryFilters;
};

export const createOwnerDiaryQuery = ({
  search,
  filters,
}: CreateOwnerDiaryQueryOptions): DiaryEntryQuery => ({
  search: {
    ...search,
  },

  ...toDiaryEntryFilterCriteria(filters),
});
