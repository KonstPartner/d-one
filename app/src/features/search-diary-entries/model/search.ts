import {
  type DiaryEntrySearch,
  type DiaryEntrySearchField,
  isDiaryEntryTextSearchField,
} from '@entities/diary';

const NUMERIC_SEARCH_INPUT_PATTERN = /^\d*(?:[.,]\d?)?$/;

const VALID_NUMERIC_SEARCH_PATTERN = /^\d+(?:[.,]\d)?$/;

export const isDiarySearchInputAllowed = (
  field: DiaryEntrySearchField,
  text: string
): boolean =>
  isDiaryEntryTextSearchField(field) || NUMERIC_SEARCH_INPUT_PATTERN.test(text);

export const normalizeDiarySearchQuery = (
  field: DiaryEntrySearchField,
  text: string
): DiaryEntrySearch['query'] => {
  const trimmedText = text.trim();

  if (isDiaryEntryTextSearchField(field)) {
    return trimmedText.length >= 2 ? trimmedText : null;
  }

  if (!VALID_NUMERIC_SEARCH_PATTERN.test(trimmedText)) {
    return null;
  }

  const value = Number(trimmedText.replace(',', '.'));

  return Number.isFinite(value) ? value : null;
};

export const createDefaultDiarySearch = (): DiaryEntrySearch => ({
  field: 'comment',
  query: null,
});
