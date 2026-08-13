import { useDiarySearchStore } from './searchDiaryEntriesStore';

export const resetDiarySearch = (): void => {
  useDiarySearchStore.getState().reset();
};
