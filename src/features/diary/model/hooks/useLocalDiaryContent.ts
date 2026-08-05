import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, type ViewToken } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { showNotification } from '@features/shared/ui';

import { diaryApi } from '../../api/diaryApi';
import useDiaryPage from '../../api/hooks/useDiaryPage';
import { useReadyDiaryDatabase } from '../../api/sqlite/DiaryDatabaseProvider';
import type { DiaryListItem } from '../list';
import { buildDiaryListItems } from '../list';
import { useDiaryListStore } from '../store';
import { useDiaryList } from '../useDiaryList';

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10,
};

const getDiaryListItemKey = (item: DiaryListItem): string => {
  if (item.type === 'dayHeader') {
    return `day:${item.dayKey}`;
  }

  return `entry:${item.entry.id}`;
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

const useLocalDiaryContent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const { currentPage, collapsedDayKeys, setCurrentPage, toggleDay } =
    useDiaryList();

  const appliedFilters = useDiaryListStore((state) => state.appliedFilters);

  const listRef = useRef<FlatList<DiaryListItem>>(null);
  const navigationInProgressRef = useRef(false);

  const [isNavigating, setIsNavigating] = useState(false);
  const [visibleEntryIds, setVisibleEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const query = useDiaryPage(currentPage, appliedFilters);
  const page = query.data;

  const listItems = useMemo(
    () =>
      buildDiaryListItems({
        entries: page?.items ?? [],
        collapsedDayKeys,
      }),
    [collapsedDayKeys, page?.items]
  );

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<DiaryListItem>[] }) => {
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

  useEffect(() => {
    if (page?.pagination.page !== currentPage) {
      return;
    }

    setVisibleEntryIds(new Set());

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [appliedFilters, currentPage, page?.pagination.page]);

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
          diaryApi.getLocalPageOptions({
            userId,
            page: nextPage,
            filters: appliedFilters,
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
      appliedFilters,
      currentPage,
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
    visibleEntryIds,
    collapsedDayKeys,
    toggleDay,
    getDiaryListItemKey,
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

export default useLocalDiaryContent;
