import { isMealRelation } from '../../model/mealRelation';

import {
  type DiaryEntryNumericRange,
  type DiaryEntryQuery,
  type DiaryEntrySearchField,
  isDiaryEntryPresence,
  isDiaryEntrySearchField,
  isDiaryEntryTextSearchField,
} from './diaryRepository.types';

export type DiaryEntryQuerySql = {
  whereSql: string;
  parameters: Record<string, string | number>;
};

const SEARCH_COLUMNS: Record<DiaryEntrySearchField, string> = {
  comment: 'comment',
  aiAnalysis: 'ai_analysis',
  glucose: 'glucose',
  shortInsulin: 'short_insulin',
  longInsulin: 'long_insulin',
  carbsGram: 'carbs_gram',
};

const isNumericRangeValid = ({ min, max }: DiaryEntryNumericRange): boolean =>
  (min === null || Number.isFinite(min)) &&
  (max === null || Number.isFinite(max)) &&
  (min === null || max === null || min <= max);

const assertValidQuery = (query: DiaryEntryQuery): void => {
  if (
    !isNumericRangeValid(query.glucose) ||
    !isNumericRangeValid(query.shortInsulin) ||
    !isNumericRangeValid(query.longInsulin) ||
    !isNumericRangeValid(query.carbsGram)
  ) {
    throw new Error('Invalid diary filter range');
  }

  if (
    query.mealRelations.some((mealRelation) => !isMealRelation(mealRelation)) ||
    !isDiaryEntryPresence(query.photo) ||
    !isDiaryEntryPresence(query.aiAnalysis)
  ) {
    throw new Error('Invalid diary filter value');
  }

  const from = query.eventAt.from?.getTime() ?? null;
  const to = query.eventAt.to?.getTime() ?? null;

  if (
    (from !== null && Number.isNaN(from)) ||
    (to !== null && Number.isNaN(to)) ||
    (from !== null && to !== null && from > to)
  ) {
    throw new Error('Invalid diary date range');
  }
};

const escapeLikeQuery = (query: string): string =>
  query.replace(/[\\%_]/g, '\\$&');

const appendSearch = (
  conditions: string[],
  parameters: Record<string, string | number>,
  query: DiaryEntryQuery
): void => {
  const { field, query: searchQuery } = query.search;

  if (!isDiaryEntrySearchField(field)) {
    throw new Error('Invalid diary search field');
  }

  if (searchQuery === null) {
    return;
  }

  const column = SEARCH_COLUMNS[field];

  if (isDiaryEntryTextSearchField(field)) {
    if (typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
      throw new Error('Invalid diary text search query');
    }

    conditions.push(`LOWER(${column}) LIKE LOWER($searchQuery) ESCAPE '\\'`);

    parameters.$searchQuery = `%${escapeLikeQuery(searchQuery.trim())}%`;

    return;
  }

  if (
    typeof searchQuery !== 'number' ||
    !Number.isFinite(searchQuery) ||
    searchQuery < 0 ||
    !Number.isInteger(searchQuery * 10)
  ) {
    throw new Error('Invalid diary numeric search query');
  }

  conditions.push(`${column} = $searchQuery`);
  parameters.$searchQuery = searchQuery;
};

const appendNumericRange = (
  conditions: string[],
  parameters: Record<string, string | number>,
  column: string,
  parameterName: string,
  range: DiaryEntryNumericRange
): void => {
  if (range.min !== null) {
    conditions.push(`${column} >= $${parameterName}Min`);

    parameters[`$${parameterName}Min`] = range.min;
  }

  if (range.max !== null) {
    conditions.push(`${column} <= $${parameterName}Max`);

    parameters[`$${parameterName}Max`] = range.max;
  }
};

export const buildDiaryEntryQuerySql = (
  userId: string,
  query: DiaryEntryQuery
): DiaryEntryQuerySql => {
  assertValidQuery(query);

  const conditions = ['user_id = $userId'];

  const parameters: Record<string, string | number> = {
    $userId: userId,
  };

  appendSearch(conditions, parameters, query);

  if (query.eventAt.from !== null) {
    conditions.push('event_at >= $eventAtFrom');

    parameters.$eventAtFrom = query.eventAt.from.getTime();
  }

  if (query.eventAt.to !== null) {
    conditions.push('event_at <= $eventAtTo');

    parameters.$eventAtTo = query.eventAt.to.getTime();
  }

  appendNumericRange(
    conditions,
    parameters,
    'glucose',
    'glucose',
    query.glucose
  );

  appendNumericRange(
    conditions,
    parameters,
    'short_insulin',
    'shortInsulin',
    query.shortInsulin
  );

  appendNumericRange(
    conditions,
    parameters,
    'long_insulin',
    'longInsulin',
    query.longInsulin
  );

  appendNumericRange(
    conditions,
    parameters,
    'carbs_gram',
    'carbsGram',
    query.carbsGram
  );

  if (query.mealRelations.length > 0) {
    const placeholders = query.mealRelations.map(
      (_, index) => `$mealRelation${index}`
    );

    query.mealRelations.forEach((mealRelation, index) => {
      parameters[`$mealRelation${index}`] = mealRelation;
    });

    conditions.push(`meal_relation IN (${placeholders.join(', ')})`);
  }

  if (query.photo === 'has') {
    conditions.push('(local_photo_uri IS NOT NULL OR photo_url IS NOT NULL)');
  } else if (query.photo === 'doesNotHave') {
    conditions.push('(local_photo_uri IS NULL AND photo_url IS NULL)');
  }

  if (query.aiAnalysis === 'has') {
    conditions.push("TRIM(ai_analysis) != ''");
  } else if (query.aiAnalysis === 'doesNotHave') {
    conditions.push("TRIM(ai_analysis) = ''");
  }

  return {
    whereSql: `WHERE ${conditions.join('\n    AND ')}`,
    parameters,
  };
};
