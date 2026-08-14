import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { cloudDiaryPageQueryOptions } from '../api/cloud/cloudDiaryQueryOptions';
import { CloudDiaryRepository } from '../api/cloud/CloudDiaryRepository';

import type { CloudDiaryCursor } from './cloudDiaryPage';

type CursorHistoryState = {
  ownerUid: string;
  cursors: Array<CloudDiaryCursor | null>;
};

type UseCloudDiaryPaginationParams = {
  ownerUid: string;
};

const createInitialHistory = (ownerUid: string): CursorHistoryState => ({
  ownerUid,
  cursors: [null],
});

export const useCloudDiaryPagination = ({
  ownerUid,
}: UseCloudDiaryPaginationParams) => {
  const queryClient = useQueryClient();

  const repository = useMemo(
    () => new CloudDiaryRepository(ownerUid),
    [ownerUid]
  );

  const ownerUidRef = useRef(ownerUid);

  const navigationInProgressRef = useRef(false);

  const [historyState, setHistoryState] = useState<CursorHistoryState>(() =>
    createInitialHistory(ownerUid)
  );

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    ownerUidRef.current = ownerUid;

    setHistoryState((current) =>
      current.ownerUid === ownerUid ? current : createInitialHistory(ownerUid)
    );
  }, [ownerUid]);

  const cursorHistory =
    historyState.ownerUid === ownerUid ? historyState.cursors : [null];

  const currentCursor = cursorHistory[cursorHistory.length - 1] ?? null;

  const pageQuery = useQuery(
    cloudDiaryPageQueryOptions({
      ownerUid,
      cursor: currentCursor,
      repository,
    })
  );

  const page = pageQuery.data;

  const hasPreviousPage = cursorHistory.length > 1;

  const hasNextPage = page?.pageInfo.hasNextPage ?? false;

  const fetchFromServer = useCallback(
    (cursor: CloudDiaryCursor | null) =>
      queryClient.fetchQuery({
        ...cloudDiaryPageQueryOptions({
          ownerUid,
          cursor,
          repository,
        }),

        staleTime: 0,
      }),
    [ownerUid, queryClient, repository]
  );

  const goNext = useCallback(async (): Promise<boolean> => {
    const nextCursor = page?.pageInfo.nextCursor ?? null;

    if (
      nextCursor === null ||
      pageQuery.isFetching ||
      navigationInProgressRef.current
    ) {
      return false;
    }

    navigationInProgressRef.current = true;

    setIsNavigating(true);

    try {
      await fetchFromServer(nextCursor);

      if (ownerUidRef.current !== ownerUid) {
        return false;
      }

      setHistoryState((current) => {
        const cursors =
          current.ownerUid === ownerUid ? current.cursors : [null];

        return {
          ownerUid,

          cursors: [...cursors, nextCursor],
        };
      });

      return true;
    } finally {
      navigationInProgressRef.current = false;

      setIsNavigating(false);
    }
  }, [
    fetchFromServer,
    ownerUid,
    page?.pageInfo.nextCursor,
    pageQuery.isFetching,
  ]);

  const goPrevious = useCallback((): boolean => {
    if (
      !hasPreviousPage ||
      pageQuery.isFetching ||
      navigationInProgressRef.current
    ) {
      return false;
    }

    setHistoryState((current) => {
      if (current.ownerUid !== ownerUid || current.cursors.length <= 1) {
        return current;
      }

      return {
        ownerUid,

        cursors: current.cursors.slice(0, -1),
      };
    });

    return true;
  }, [hasPreviousPage, ownerUid, pageQuery.isFetching]);

  const refreshFirstPage = useCallback(async (): Promise<boolean> => {
    if (pageQuery.isFetching || navigationInProgressRef.current) {
      return false;
    }

    navigationInProgressRef.current = true;

    setIsNavigating(true);

    try {
      await fetchFromServer(null);

      if (ownerUidRef.current !== ownerUid) {
        return false;
      }

      setHistoryState(createInitialHistory(ownerUid));

      return true;
    } finally {
      navigationInProgressRef.current = false;

      setIsNavigating(false);
    }
  }, [fetchFromServer, ownerUid, pageQuery.isFetching]);

  return {
    page,

    error: pageQuery.error,

    hasPreviousPage,
    hasNextPage,

    goPrevious,
    goNext,

    refreshFirstPage,

    isInitialLoading: page === undefined && pageQuery.isLoading,

    hasInitialError: page === undefined && pageQuery.isError,

    isLoading: pageQuery.isFetching || isNavigating,
  };
};
