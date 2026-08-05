import { create } from 'zustand';

import type { DiaryDayKey } from './list';
import type {
  DiaryFilterDateBoundary,
  DiaryFilterNumericField,
  DiaryFilterNumericRange,
  DiaryFilterPresence,
  DiaryFilters,
  DiarySearchField,
  MealRelation,
} from './types';
import {
  areDiaryFilterRangesValid,
  cloneDiaryFilters,
  createDefaultDiaryFilters,
  normalizeDiaryFilters,
} from './types';

type DiaryListStore = {
  currentPage: number;
  collapsedDayKeys: Set<DiaryDayKey>;
  filterModalVisible: boolean;
  draftFilters: DiaryFilters;
  appliedFilters: DiaryFilters;
  searchText: string;

  setCurrentPage: (page: number) => void;
  setSearchText: (text: string) => void;
  setSearchField: (field: DiarySearchField) => void;
  applySearchQuery: (query: string | number | null) => void;
  toggleDay: (dayKey: DiaryDayKey) => void;
  collapseAllDays: (dayKeys: ReadonlyArray<DiaryDayKey>) => void;
  expandAllDays: () => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  setFilterActiveBoundary: (boundary: DiaryFilterDateBoundary) => void;
  setFilterDate: (
    boundary: DiaryFilterDateBoundary,
    date: string | null
  ) => void;
  clearFilterDates: () => void;
  setFilterNumericRange: (
    field: DiaryFilterNumericField,
    range: DiaryFilterNumericRange
  ) => void;
  resetFilterNumericRange: (field: DiaryFilterNumericField) => void;
  toggleFilterMealRelation: (mealRelation: MealRelation) => void;
  setFilterPresence: (
    field: 'photo' | 'aiAnalysis',
    value: DiaryFilterPresence
  ) => void;
  clearFilterDraft: () => void;
  applyFilterDraft: () => void;
  resetListState: () => void;
};

const assertValidPage = (page: number): void => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid diary page: ${page}`);
  }
};

const createInitialState = () => {
  const appliedFilters = createDefaultDiaryFilters();

  return {
    currentPage: 1,
    collapsedDayKeys: new Set<DiaryDayKey>(),
    filterModalVisible: false,
    draftFilters: cloneDiaryFilters(appliedFilters),
    appliedFilters,
    searchText: '',
  };
};

export const useDiaryListStore = create<DiaryListStore>((set) => ({
  ...createInitialState(),

  setCurrentPage: (page) => {
    assertValidPage(page);

    set({
      currentPage: page,
      collapsedDayKeys: new Set(),
    });
  },

  setSearchText: (text) => {
    set({ searchText: text });
  },

  setSearchField: (field) => {
    set((state) => {
      const search = { field, query: null };

      return {
        currentPage: 1,
        collapsedDayKeys: new Set(),
        searchText: '',
        appliedFilters: {
          ...state.appliedFilters,
          search,
        },
        draftFilters: {
          ...state.draftFilters,
          search: { ...search },
        },
      };
    });
  },

  applySearchQuery: (query) => {
    set((state) => {
      if (state.appliedFilters.search.query === query) {
        return state;
      }

      const search = {
        field: state.appliedFilters.search.field,
        query,
      };

      return {
        currentPage: 1,
        collapsedDayKeys: new Set(),
        appliedFilters: {
          ...state.appliedFilters,
          search,
        },
        draftFilters: {
          ...state.draftFilters,
          search: { ...search },
        },
      };
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

  openFilterModal: () => {
    set((state) => ({
      filterModalVisible: true,
      draftFilters: cloneDiaryFilters(state.appliedFilters),
    }));
  },

  closeFilterModal: () => {
    set((state) => ({
      filterModalVisible: false,
      draftFilters: cloneDiaryFilters(state.appliedFilters),
    }));
  },

  setFilterActiveBoundary: (boundary) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        date: {
          ...state.draftFilters.date,
          activeBoundary: boundary,
        },
      },
    }));
  },

  setFilterDate: (boundary, date) => {
    set((state) => {
      const nextDate = {
        ...state.draftFilters.date,
        [boundary]: date,
      };

      if (boundary === 'from' && date !== null) {
        nextDate.activeBoundary = 'to';
      }

      const normalizedDate =
        nextDate.from !== null &&
        nextDate.to !== null &&
        nextDate.from > nextDate.to
          ? {
              from: nextDate.to,
              to: nextDate.from,
              activeBoundary: nextDate.activeBoundary,
            }
          : nextDate;

      return {
        draftFilters: {
          ...state.draftFilters,
          date: normalizedDate,
        },
      };
    });
  },

  clearFilterDates: () => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        date: {
          from: null,
          to: null,
          activeBoundary: 'from',
        },
      },
    }));
  },

  setFilterNumericRange: (field, range) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        [field]: { ...range },
      },
    }));
  },

  resetFilterNumericRange: (field) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        [field]: {
          min: null,
          max: null,
        },
      },
    }));
  },

  toggleFilterMealRelation: (mealRelation) => {
    set((state) => {
      const mealRelations = state.draftFilters.mealRelations.includes(
        mealRelation
      )
        ? state.draftFilters.mealRelations.filter(
            (value) => value !== mealRelation
          )
        : [...state.draftFilters.mealRelations, mealRelation];

      return {
        draftFilters: normalizeDiaryFilters({
          ...state.draftFilters,
          mealRelations,
        }),
      };
    });
  },

  setFilterPresence: (field, value) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        [field]: value,
      },
    }));
  },

  clearFilterDraft: () => {
    set((state) => ({
      draftFilters: {
        ...createDefaultDiaryFilters(),
        search: { ...state.draftFilters.search },
      },
    }));
  },

  applyFilterDraft: () => {
    set((state) => {
      if (!areDiaryFilterRangesValid(state.draftFilters)) {
        throw new Error('Invalid diary filter range');
      }

      const appliedFilters = normalizeDiaryFilters(state.draftFilters);

      return {
        currentPage: 1,
        collapsedDayKeys: new Set(),
        appliedFilters,
        draftFilters: cloneDiaryFilters(appliedFilters),
      };
    });
  },

  resetListState: () => {
    set(createInitialState());
  },
}));
