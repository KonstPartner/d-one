import { useDiaryFilterStore } from './filterDiaryEntriesStore';

export const resetDiaryFilters = (): void => {
  useDiaryFilterStore.getState().reset();
};
