import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useDiaryFilterStore } from './filterDiaryEntriesStore';
import { areDiaryFiltersEqual, createDefaultDiaryFilters } from './filters';

const EMPTY_DIARY_FILTERS = createDefaultDiaryFilters();

export const useDiaryFilters = () => {
  const state = useDiaryFilterStore(
    useShallow((store) => ({
      visible: store.visible,

      draftFilters: store.draftFilters,

      appliedFilters: store.appliedFilters,

      open: store.open,
      close: store.close,

      setActiveDateBoundary: store.setActiveDateBoundary,

      setDate: store.setDate,

      clearDates: store.clearDates,

      setNumericRange: store.setNumericRange,

      resetNumericRange: store.resetNumericRange,

      toggleMealRelation: store.toggleMealRelation,

      setPresence: store.setPresence,

      clearDraft: store.clearDraft,
    }))
  );

  const apply = useCallback((): boolean => {
    const { draftFilters, appliedFilters, applyDraft } =
      useDiaryFilterStore.getState();

    if (areDiaryFiltersEqual(draftFilters, appliedFilters)) {
      return false;
    }

    applyDraft();

    return true;
  }, []);

  const hasAppliedFilters = !areDiaryFiltersEqual(
    state.appliedFilters,
    EMPTY_DIARY_FILTERS
  );

  return {
    ...state,

    apply,

    hasAppliedFilters,
  };
};
