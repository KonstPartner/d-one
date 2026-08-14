import { useCallback, useMemo } from 'react';

import {
  buildDiaryListItems,
  getDiaryListItemKey,
  useCloudDiaryPagination,
} from '@entities/diary';

import { useFollowerDiaryListState } from './useFollowerDiaryListState';
import { useFollowerDiaryViewability } from './useFollowerDiaryViewability';

export const useFollowerDiaryList = (ownerUid: string) => {
  const {
    collapsedDayKeys,

    toggleDay,
    expandAllDays,
  } = useFollowerDiaryListState(ownerUid);

  const pagination = useCloudDiaryPagination({
    ownerUid,
  });

  const viewability = useFollowerDiaryViewability(ownerUid);

  const listItems = useMemo(
    () => buildDiaryListItems(pagination.page?.items ?? [], collapsedDayKeys),
    [collapsedDayKeys, pagination.page?.items]
  );

  const goPrevious = useCallback((): boolean => {
    const changed = pagination.goPrevious();

    if (!changed) {
      return false;
    }

    expandAllDays();
    viewability.resetViewability();

    return true;
  }, [expandAllDays, pagination.goPrevious, viewability.resetViewability]);

  const goNext = useCallback(async (): Promise<boolean> => {
    const changed = await pagination.goNext();

    if (!changed) {
      return false;
    }

    expandAllDays();

    viewability.resetViewability();

    return true;
  }, [expandAllDays, pagination.goNext, viewability.resetViewability]);

  const refreshFirstPage = useCallback(async (): Promise<boolean> => {
    const refreshed = await pagination.refreshFirstPage();

    if (!refreshed) {
      return false;
    }

    expandAllDays();

    viewability.resetViewability();

    return true;
  }, [
    expandAllDays,
    pagination.refreshFirstPage,
    viewability.resetViewability,
  ]);

  return {
    listRef: viewability.listRef,

    page: pagination.page,

    listItems,

    visibleEntryIds: viewability.visibleEntryIds,

    collapsedDayKeys,

    toggleDay,

    getListItemKey: getDiaryListItemKey,

    viewabilityConfig: viewability.viewabilityConfig,

    handleViewableItemsChanged: viewability.handleViewableItemsChanged,

    hasPreviousPage: pagination.hasPreviousPage,

    hasNextPage: pagination.hasNextPage,

    goPrevious,
    goNext,

    refreshFirstPage,

    error: pagination.error,

    isInitialLoading: pagination.isInitialLoading,

    hasInitialError: pagination.hasInitialError,

    isLoading: pagination.isLoading,
  };
};
