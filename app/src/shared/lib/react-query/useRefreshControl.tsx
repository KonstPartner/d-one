import { useCallback, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import {
  GetNextPageParamFunction,
  QueryFunction,
  QueryKey,
  useQueryClient,
} from '@tanstack/react-query';

type RefreshTask = {
  key: QueryKey | undefined;
  queryFn?: QueryFunction<any, any, number> | QueryFunction<any, any>;
  isInfinite?: boolean;
  initialPageParam?: number;
  getNextPageParam?: GetNextPageParamFunction<number, any>;
};

type SingleTaskOptions = {
  queryFn?: QueryFunction<any, any, number> | QueryFunction<any, any>;
  isInfinite?: boolean;
  initialPageParam?: number;
  getNextPageParam?: GetNextPageParamFunction<number, any>;
};

const DEFAULT_INFINITE_INITIAL_PAGE = 1;

const normalizeTasks = (
  keyOrTasks: readonly unknown[] | RefreshTask[] | undefined,
  options?: SingleTaskOptions
): RefreshTask[] => {
  if (!keyOrTasks) {
    return [];
  }

  if (
    Array.isArray(keyOrTasks) &&
    keyOrTasks.length > 0 &&
    typeof keyOrTasks[0] === 'object' &&
    keyOrTasks[0] !== null &&
    'key' in keyOrTasks[0]
  ) {
    return keyOrTasks as RefreshTask[];
  }

  return [
    {
      key: keyOrTasks as QueryKey,
      queryFn: options?.queryFn,
      isInfinite: options?.isInfinite,
      initialPageParam: options?.initialPageParam,
      getNextPageParam: options?.getNextPageParam,
    },
  ];
};

export const useRefreshControl = (
  keyOrTasks: readonly unknown[] | RefreshTask[] | undefined,
  options: SingleTaskOptions = {}
) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const tasks = useMemo(
    () => normalizeTasks(keyOrTasks, options),
    [keyOrTasks, options]
  );

  const onRefresh = useCallback(async () => {
    const validTasks = tasks.filter((task) => task.key?.length);

    if (!validTasks.length || refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all(
        validTasks.map(async (task) => {
          const {
            key,
            queryFn,
            isInfinite,
            initialPageParam,
            getNextPageParam,
          } = task;

          if (!key?.length) {
            return;
          }

          if (isInfinite) {
            await queryClient.prefetchInfiniteQuery({
              queryKey: key,
              initialPageParam:
                initialPageParam ?? DEFAULT_INFINITE_INITIAL_PAGE,
              queryFn: queryFn as QueryFunction<any, any, number>,
              getNextPageParam: getNextPageParam ?? (() => undefined),
            });

            return;
          }

          await queryClient.prefetchQuery({
            queryKey: key,
            queryFn: queryFn as QueryFunction<any, any>,
          });
        })
      );
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refreshing, tasks]);

  return {
    refreshControl: (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    ),
    refreshing,
    onRefresh,
  };
};

export type { RefreshTask };
