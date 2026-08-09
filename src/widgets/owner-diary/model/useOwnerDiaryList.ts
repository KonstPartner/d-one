import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, type ViewToken } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntryQuery,
  diaryLocalPageQueryOptions,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import {
  buildOwnerDiaryListItems,
  getOwnerDiaryListItemKey,
  type OwnerDiaryListItem,
} from './ownerDiaryList';
import { useOwnerDiaryListState } from './useOwnerDiaryListState';

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10,
};

const haveSameIds = (
  currentIds: ReadonlySet<string>,
  nextIds: ReadonlySet<string>
): boolean => {
  if (currentIds.size !== nextIds.size) {
    return false;
  }

  for (const id of currentIds) {
    if (!nextIds.has(id)) {
      return false;
    }
  }

  return true;
};

export const useOwnerDiaryList = (diaryQuery: DiaryEntryQuery) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const {
    currentPage,
    collapsedDayKeys,
    setCurrentPage,
    toggleDay,
    collapseAllDays,
    expandAllDays,
    resetList,
  } = useOwnerDiaryListState();

  const query = useQuery(
    diaryLocalPageQueryOptions({
      userId,
      page: currentPage,
      query: diaryQuery,
      repository,
    })
  );

  const page = query.data;

  const listItems = useMemo(
    () => buildOwnerDiaryListItems(page?.items ?? [], collapsedDayKeys),
    [collapsedDayKeys, page?.items]
  );

  const listRef = useRef<FlatList<OwnerDiaryListItem>>(null);

  const navigationInProgressRef = useRef(false);

  const [isNavigating, setIsNavigating] = useState(false);

  const [visibleEntryIds, setVisibleEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (page?.pagination.page !== currentPage) {
      return;
    }

    setVisibleEntryIds(new Set());

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [currentPage, diaryQuery, page?.pagination.page]);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<OwnerDiaryListItem>[] }) => {
      const nextVisibleEntryIds = new Set<string>();

      for (const token of viewableItems) {
        if (token.isViewable && token.item.type === 'entry') {
          nextVisibleEntryIds.add(token.item.entry.id);
        }
      }

      setVisibleEntryIds((currentVisibleEntryIds) =>
        haveSameIds(currentVisibleEntryIds, nextVisibleEntryIds)
          ? currentVisibleEntryIds
          : nextVisibleEntryIds
      );
    }
  ).current;

  const handleChangePage = useCallback(
    async (nextPage: number): Promise<void> => {
      if (
        query.isFetching ||
        navigationInProgressRef.current ||
        nextPage === currentPage
      ) {
        return;
      }

      navigationInProgressRef.current = true;

      setIsNavigating(true);

      try {
        await queryClient.fetchQuery(
          diaryLocalPageQueryOptions({
            userId,
            page: nextPage,
            query: diaryQuery,
            repository,
          })
        );

        setCurrentPage(nextPage);
      } catch (error) {
        console.error('Failed to load diary page', error);

        showNotification('error', t('diary.list.loadFailed'));
      } finally {
        navigationInProgressRef.current = false;

        setIsNavigating(false);
      }
    },
    [
      currentPage,
      diaryQuery,
      query.isFetching,
      queryClient,
      repository,
      setCurrentPage,
      t,
      userId,
    ]
  );

  const handleRetry = useCallback(() => {
    void query.refetch();
  }, [query.refetch]);

  return {
    listRef,

    page,
    listItems,

    currentPage,
    visibleEntryIds,
    collapsedDayKeys,

    toggleDay,
    collapseAllDays,
    expandAllDays,
    resetList,

    getListItemKey: getOwnerDiaryListItemKey,

    viewabilityConfig: VIEWABILITY_CONFIG,

    handleViewableItemsChanged,
    handleChangePage,
    handleRetry,

    isInitialLoading: query.isLoading && page === undefined,

    hasInitialError: query.isError && page === undefined,

    isRefetching: query.isRefetching,

    isPaginationLoading: query.isFetching || isNavigating,
  };
};
