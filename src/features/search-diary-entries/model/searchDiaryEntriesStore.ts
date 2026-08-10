import { create } from 'zustand';

import type { DiaryEntrySearch, DiaryEntrySearchField } from '@entities/diary';

import { createDefaultDiarySearch, normalizeDiarySearchQuery } from './search';

type DiarySearchState = {
  text: string;
  search: DiaryEntrySearch;
};

type DiarySearchActions = {
  setText: (text: string) => void;

  setField: (field: DiaryEntrySearchField) => void;

  applyText: () => DiaryEntrySearch;

  clear: () => void;

  reset: () => void;
};

type DiarySearchStore = DiarySearchState & DiarySearchActions;

const createInitialState = (): DiarySearchState => ({
  text: '',
  search: createDefaultDiarySearch(),
});

export const useDiarySearchStore = create<DiarySearchStore>((set, get) => ({
  ...createInitialState(),

  setText: (text) => {
    set({ text });
  },

  setField: (field) => {
    const { search } = get();

    if (search.field === field) {
      return;
    }

    set({
      text: '',

      search: {
        field,
        query: null,
      },
    });
  },

  applyText: () => {
    const { text, search } = get();

    const query = normalizeDiarySearchQuery(search.field, text);

    if (search.query === query) {
      return search;
    }

    const nextSearch: DiaryEntrySearch = {
      field: search.field,
      query,
    };

    set({
      search: nextSearch,
    });

    return nextSearch;
  },

  clear: () => {
    const { text, search } = get();

    if (text.length === 0 && search.query === null) {
      return;
    }

    if (search.query === null) {
      set({
        text: '',
      });

      return;
    }

    set({
      text: '',

      search: {
        field: search.field,
        query: null,
      },
    });
  },

  reset: () => {
    set(createInitialState());
  },
}));
