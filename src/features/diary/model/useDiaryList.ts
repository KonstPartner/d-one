import { useShallow } from 'zustand/react/shallow';

import { useDiaryListStore } from './store';

export const useDiaryList = () =>
  useDiaryListStore(
    useShallow((state) => ({
      currentPage: state.currentPage,
      collapsedDayKeys: state.collapsedDayKeys,
      setCurrentPage: state.setCurrentPage,
      toggleDay: state.toggleDay,
    }))
  );
