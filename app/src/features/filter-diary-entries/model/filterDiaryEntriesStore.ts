import { create } from 'zustand';

import {
  createEmptyDiaryEntryNumericRange,
  type MealRelation,
} from '@entities/diary';

import {
  areDiaryFilterRangesValid,
  cloneDiaryFilters,
  createDefaultDiaryFilters,
  normalizeDiaryFilters,
} from './filters';
import type {
  DiaryFilterDateBoundary,
  DiaryFilterNumericField,
  DiaryFilterNumericRange,
  DiaryFilterPresence,
  DiaryFilters,
} from './types';

type DiaryFilterState = {
  visible: boolean;
  draftFilters: DiaryFilters;
  appliedFilters: DiaryFilters;
};

type DiaryFilterActions = {
  open: () => void;
  close: () => void;

  setActiveDateBoundary: (boundary: DiaryFilterDateBoundary) => void;

  setDate: (boundary: DiaryFilterDateBoundary, date: string | null) => void;

  clearDates: () => void;

  setNumericRange: (
    field: DiaryFilterNumericField,
    range: DiaryFilterNumericRange
  ) => void;

  resetNumericRange: (field: DiaryFilterNumericField) => void;

  toggleMealRelation: (mealRelation: MealRelation) => void;

  setPresence: (
    field: 'photo' | 'aiAnalysis',
    value: DiaryFilterPresence
  ) => void;

  clearDraft: () => void;

  applyDraft: () => DiaryFilters;

  reset: () => void;
};

type DiaryFilterStore = DiaryFilterState & DiaryFilterActions;

const createInitialState = (): DiaryFilterState => {
  const appliedFilters = createDefaultDiaryFilters();

  return {
    visible: false,
    appliedFilters,
    draftFilters: cloneDiaryFilters(appliedFilters),
  };
};

export const useDiaryFilterStore = create<DiaryFilterStore>((set, get) => ({
  ...createInitialState(),

  open: () => {
    set((state) => ({
      visible: true,

      draftFilters: cloneDiaryFilters(state.appliedFilters),
    }));
  },

  close: () => {
    set((state) => ({
      visible: false,

      draftFilters: cloneDiaryFilters(state.appliedFilters),
    }));
  },

  setActiveDateBoundary: (boundary) => {
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

  setDate: (boundary, date) => {
    set((state) => {
      const nextFilters: DiaryFilters = {
        ...state.draftFilters,

        date: {
          ...state.draftFilters.date,

          [boundary]: date,

          activeBoundary:
            boundary === 'from' && date !== null
              ? 'to'
              : state.draftFilters.date.activeBoundary,
        },
      };

      return {
        draftFilters: normalizeDiaryFilters(nextFilters),
      };
    });
  },

  clearDates: () => {
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

  setNumericRange: (field, range) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,

        [field]: {
          ...range,
        },
      },
    }));
  },

  resetNumericRange: (field) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,

        [field]: createEmptyDiaryEntryNumericRange(),
      },
    }));
  },

  toggleMealRelation: (mealRelation) => {
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

  setPresence: (field, value) => {
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,

        [field]: value,
      },
    }));
  },

  clearDraft: () => {
    set({
      draftFilters: createDefaultDiaryFilters(),
    });
  },

  applyDraft: () => {
    const { draftFilters } = get();

    if (!areDiaryFilterRangesValid(draftFilters)) {
      throw new Error('Invalid diary filter range');
    }

    const appliedFilters = normalizeDiaryFilters(draftFilters);

    set({
      appliedFilters,

      draftFilters: cloneDiaryFilters(appliedFilters),
    });

    return cloneDiaryFilters(appliedFilters);
  },

  reset: () => {
    set(createInitialState());
  },
}));
