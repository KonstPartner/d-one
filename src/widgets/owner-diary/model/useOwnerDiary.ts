import { useCallback, useEffect, useMemo } from 'react';

import {
  resetDiaryFilters,
  useDiaryFilters,
} from '@features/filter-diary-entries';
import {
  resetDiarySearch,
  useDiarySearch,
} from '@features/search-diary-entries';
import type { DiaryEntrySearchField } from '@entities/diary';

import { createOwnerDiaryQuery } from './createOwnerDiaryQuery';
import { useOwnerDiaryList } from './useOwnerDiaryList';

export const useOwnerDiary = () => {
  const filters = useDiaryFilters();

  const search = useDiarySearch();

  const diaryQuery = useMemo(
    () =>
      createOwnerDiaryQuery({
        search: search.search,

        filters: filters.appliedFilters,
      }),
    [filters.appliedFilters, search.search]
  );

  const list = useOwnerDiaryList(diaryQuery);

  const applyFilters = useCallback(() => {
    if (filters.apply()) {
      list.resetList();
    }
  }, [filters.apply, list.resetList]);

  const applySearchText = useCallback(() => {
    const previousSearch = search.search;

    const nextSearch = search.applyText();

    if (nextSearch !== previousSearch) {
      list.resetList();
    }
  }, [list.resetList, search.applyText, search.search]);

  const setSearchField = useCallback(
    (field: DiaryEntrySearchField) => {
      if (field === search.search.field) {
        return;
      }

      search.setField(field);

      list.resetList();
    },
    [list.resetList, search.search.field, search.setField]
  );

  const clearSearch = useCallback(() => {
    const hadAppliedSearch = search.search.query !== null;

    search.clear();

    if (hadAppliedSearch) {
      list.resetList();
    }
  }, [list.resetList, search.clear, search.search.query]);

  useEffect(
    () => () => {
      resetDiaryFilters();
      resetDiarySearch();
    },
    []
  );

  return {
    list,

    filters: {
      visible: filters.visible,

      draftFilters: filters.draftFilters,

      appliedFilters: filters.appliedFilters,

      hasAppliedFilters: filters.hasAppliedFilters,

      open: filters.open,

      close: filters.close,

      setActiveDateBoundary: filters.setActiveDateBoundary,

      setDate: filters.setDate,

      clearDates: filters.clearDates,

      setNumericRange: filters.setNumericRange,

      resetNumericRange: filters.resetNumericRange,

      toggleMealRelation: filters.toggleMealRelation,

      setPresence: filters.setPresence,

      clearDraft: filters.clearDraft,

      apply: applyFilters,
    },

    search: {
      text: search.text,

      search: search.search,

      setText: search.setText,

      setField: setSearchField,

      applyText: applySearchText,

      clear: clearSearch,
    },
  };
};
