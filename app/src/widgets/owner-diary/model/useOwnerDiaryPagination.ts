import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntryQuery,
  diaryLocalPageQueryOptions,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

type UseOwnerDiaryPaginationParams = {
  diaryQuery: DiaryEntryQuery;

  currentPage: number;

  setCurrentPage: (page: number) => void;
};

export const useOwnerDiaryPagination = ({
  diaryQuery,

  currentPage,

  setCurrentPage,
}: UseOwnerDiaryPaginationParams) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const query = useQuery(
    diaryLocalPageQueryOptions({
      userId,
      page: currentPage,
      query: diaryQuery,
      repository,
    })
  );

  const page = query.data;

  const navigationInProgressRef = useRef(false);

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (page === undefined) {
      return;
    }

    const lastPage = Math.max(page.pagination.totalPages, 1);

    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [currentPage, page?.pagination.totalPages, setCurrentPage]);

  const reconcileCurrentPage = useCallback(async (): Promise<boolean> => {
    try {
      const latestPage = await repository.findPage(currentPage, diaryQuery);

      const lastPage = Math.max(latestPage.pagination.totalPages, 1);

      if (currentPage <= lastPage) {
        return false;
      }

      setCurrentPage(lastPage);

      return true;
    } catch (error) {
      console.error('Failed to reconcile diary page', error);

      showNotification('error', t('diary.list.loadFailed'));

      return false;
    }
  }, [currentPage, diaryQuery, repository, setCurrentPage, t]);

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
    page,

    reconcileCurrentPage,

    handleChangePage,
    handleRetry,

    isInitialLoading: query.isLoading && page === undefined,

    hasInitialError: query.isError && page === undefined,

    isRefetching: query.isRefetching,

    isPaginationLoading: query.isFetching || isNavigating,
  };
};
