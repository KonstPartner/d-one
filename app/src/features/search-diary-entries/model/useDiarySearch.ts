import { useShallow } from 'zustand/react/shallow';

import { useDiarySearchStore } from './searchDiaryEntriesStore';

export const useDiarySearch = () =>
  useDiarySearchStore(
    useShallow((state) => ({
      text: state.text,
      search: state.search,
      setText: state.setText,
      setField: state.setField,
      applyText: state.applyText,
      clear: state.clear,
    }))
  );
