import { create } from 'zustand';

import type { DiaryDayKey } from './list';

type DiaryListStore = {
  currentPage: number;
  collapsedDayKeys: Set<DiaryDayKey>;

  setCurrentPage: (page: number) => void;
  toggleDay: (dayKey: DiaryDayKey) => void;
  collapseAllDays: (dayKeys: ReadonlyArray<DiaryDayKey>) => void;
  expandAllDays: () => void;
  resetListState: () => void;
};

const assertValidPage = (page: number): void => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid diary page: ${page}`);
  }
};

export const useDiaryListStore = create<DiaryListStore>((set) => ({
  currentPage: 1,
  collapsedDayKeys: new Set(),

  setCurrentPage: (page) => {
    assertValidPage(page);

    set({
      currentPage: page,
      collapsedDayKeys: new Set(),
    });
  },

  toggleDay: (dayKey) => {
    set((state) => {
      const collapsedDayKeys = new Set(state.collapsedDayKeys);

      if (collapsedDayKeys.has(dayKey)) {
        collapsedDayKeys.delete(dayKey);
      } else {
        collapsedDayKeys.add(dayKey);
      }

      return {
        collapsedDayKeys,
      };
    });
  },

  collapseAllDays: (dayKeys) => {
    set({
      collapsedDayKeys: new Set(dayKeys),
    });
  },

  expandAllDays: () => {
    set({
      collapsedDayKeys: new Set(),
    });
  },

  resetListState: () => {
    set({
      currentPage: 1,
      collapsedDayKeys: new Set(),
    });
  },
}));
