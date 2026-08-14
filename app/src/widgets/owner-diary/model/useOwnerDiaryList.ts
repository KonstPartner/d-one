import { useMemo } from 'react';

import type { DiaryEntryQuery } from '@entities/diary';

import {
  buildOwnerDiaryListItems,
  getOwnerDiaryListItemKey,
} from './ownerDiaryList';
import { useOwnerDiaryListState } from './useOwnerDiaryListState';
import { useOwnerDiaryPagination } from './useOwnerDiaryPagination';
import { useOwnerDiaryViewability } from './useOwnerDiaryViewability';

export const useOwnerDiaryList = (diaryQuery: DiaryEntryQuery) => {
  const {
    currentPage,
    collapsedDayKeys,

    setCurrentPage,

    toggleDay,
    collapseAllDays,
    expandAllDays,

    resetList,
  } = useOwnerDiaryListState();

  const pagination = useOwnerDiaryPagination({
    diaryQuery,

    currentPage,

    setCurrentPage,
  });

  const listItems = useMemo(
    () =>
      buildOwnerDiaryListItems(pagination.page?.items ?? [], collapsedDayKeys),
    [collapsedDayKeys, pagination.page?.items]
  );

  const viewability = useOwnerDiaryViewability({
    currentPage,

    diaryQuery,

    loadedPage: pagination.page?.pagination.page,
  });

  return {
    listRef: viewability.listRef,

    page: pagination.page,
    listItems,

    currentPage,

    visibleEntryIds: viewability.visibleEntryIds,

    collapsedDayKeys,

    toggleDay,

    collapseAllDays,
    expandAllDays,

    resetList,

    reconcileCurrentPage: pagination.reconcileCurrentPage,

    getListItemKey: getOwnerDiaryListItemKey,

    viewabilityConfig: viewability.viewabilityConfig,

    handleViewableItemsChanged: viewability.handleViewableItemsChanged,

    handleChangePage: pagination.handleChangePage,

    handleRetry: pagination.handleRetry,

    isInitialLoading: pagination.isInitialLoading,

    hasInitialError: pagination.hasInitialError,

    isRefetching: pagination.isRefetching,

    isPaginationLoading: pagination.isPaginationLoading,
  };
};
