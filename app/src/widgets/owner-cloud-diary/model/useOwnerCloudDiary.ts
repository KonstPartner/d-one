import { useCallback } from 'react';

import { type DiaryDayKey, useCloudDiaryList } from '@entities/diary';

import { useOwnerCloudDiarySelection } from './useOwnerCloudDiarySelection';

type UseOwnerCloudDiaryParams = {
  ownerUid: string;
};

export const useOwnerCloudDiary = ({ ownerUid }: UseOwnerCloudDiaryParams) => {
  const list = useCloudDiaryList({
    ownerUid,
  });

  const selection = useOwnerCloudDiarySelection({
    entries: list.page?.items ?? [],

    onEnter: list.expandAllDays,
  });

  const toggleDay = useCallback(
    (dayKey: DiaryDayKey) => {
      if (selection.selectionMode) {
        return;
      }

      list.toggleDay(dayKey);
    },
    [list.toggleDay, selection.selectionMode]
  );

  const goPrevious = useCallback((): boolean => {
    if (selection.selectionMode) {
      return false;
    }

    return list.goPrevious();
  }, [list.goPrevious, selection.selectionMode]);

  const goNext = useCallback(async (): Promise<boolean> => {
    if (selection.selectionMode) {
      return false;
    }

    return list.goNext();
  }, [list.goNext, selection.selectionMode]);

  const refreshFirstPage = useCallback(async (): Promise<boolean> => {
    selection.exitSelection();

    return list.refreshFirstPage();
  }, [list.refreshFirstPage, selection.exitSelection]);

  return {
    listRef: list.listRef,

    page: list.page,

    listItems: list.listItems,

    visibleEntryIds: list.visibleEntryIds,
    hasViewabilitySnapshot: list.hasViewabilitySnapshot,

    collapsedDayKeys: list.collapsedDayKeys,

    toggleDay,

    getListItemKey: list.getListItemKey,

    viewabilityConfig: list.viewabilityConfig,

    handleViewableItemsChanged: list.handleViewableItemsChanged,

    hasPreviousPage: list.hasPreviousPage,

    hasNextPage: list.hasNextPage,

    goPrevious,
    goNext,

    refreshFirstPage,

    error: list.error,

    isInitialLoading: list.isInitialLoading,

    hasInitialError: list.hasInitialError,

    isLoading: list.isLoading,

    selection,
  };
};
