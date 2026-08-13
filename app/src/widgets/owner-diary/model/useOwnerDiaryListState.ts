import { useCallback, useState } from 'react';

import type { DiaryDayKey } from '@entities/diary';

const assertValidPage = (page: number): void => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid diary page: ${page}`);
  }
};

export const useOwnerDiaryListState = () => {
  const [currentPage, setCurrentPageState] = useState(1);

  const [collapsedDayKeys, setCollapsedDayKeys] = useState<
    ReadonlySet<DiaryDayKey>
  >(() => new Set());

  const setCurrentPage = useCallback((page: number) => {
    assertValidPage(page);

    setCurrentPageState(page);
    setCollapsedDayKeys(new Set());
  }, []);

  const toggleDay = useCallback((dayKey: DiaryDayKey) => {
    setCollapsedDayKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(dayKey)) {
        nextKeys.delete(dayKey);
      } else {
        nextKeys.add(dayKey);
      }

      return nextKeys;
    });
  }, []);

  const collapseAllDays = useCallback((dayKeys: readonly DiaryDayKey[]) => {
    setCollapsedDayKeys(new Set(dayKeys));
  }, []);

  const expandAllDays = useCallback(() => {
    setCollapsedDayKeys(new Set());
  }, []);

  const resetList = useCallback(() => {
    setCurrentPageState(1);
    setCollapsedDayKeys(new Set());
  }, []);

  return {
    currentPage,
    collapsedDayKeys,

    setCurrentPage,
    toggleDay,

    collapseAllDays,
    expandAllDays,

    resetList,
  };
};
