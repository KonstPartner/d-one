import type { DiaryEntry } from './diaryEntry';
import {
  DIARY_ENTRY_COMMENT_MAXIMUM_LENGTH,
  DIARY_ENTRY_METRIC_MAXIMUM,
} from './diaryEntryConstraints';

export type DiaryEntryEditableValues = Pick<
  DiaryEntry,
  | 'glucose'
  | 'mealRelation'
  | 'shortInsulin'
  | 'ultraShortInsulin'
  | 'longInsulin'
  | 'carbsGram'
  | 'comment'
  | 'eventAt'
>;

export type DiaryEntryValidationError =
  | 'invalidEventAt'
  | 'invalidGlucose'
  | 'invalidShortInsulin'
  | 'invalidUltraShortInsulin'
  | 'invalidLongInsulin'
  | 'invalidCarbsGram'
  | 'commentTooLong'
  | 'emptyEntry';

const DECIMAL_PRECISION_TOLERANCE = 1e-8;

const hasMaximumOneDecimalPlace = (value: number): boolean => {
  const shiftedValue = value * 10;

  return (
    Math.abs(shiftedValue - Math.round(shiftedValue)) <
    DECIMAL_PRECISION_TOLERANCE
  );
};

const isValidMetric = (value: number | null, maximum: number): boolean =>
  value === null ||
  (Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum &&
    hasMaximumOneDecimalPlace(value));

const hasMeaningfulContent = (
  values: DiaryEntryEditableValues,
  hasPhoto: boolean
): boolean =>
  values.glucose !== null ||
  values.mealRelation !== null ||
  values.shortInsulin !== null ||
  values.ultraShortInsulin !== null ||
  values.longInsulin !== null ||
  values.carbsGram !== null ||
  values.comment.length > 0 ||
  hasPhoto;

export const normalizeDiaryEntryEditableValues = (
  values: DiaryEntryEditableValues
): DiaryEntryEditableValues => ({
  ...values,
  comment: values.comment.trim(),
  eventAt: new Date(values.eventAt),
});

export const validateDiaryEntryEditableValues = ({
  values,
  hasPhoto,
}: {
  values: DiaryEntryEditableValues;
  hasPhoto: boolean;
}): DiaryEntryValidationError | null => {
  if (Number.isNaN(values.eventAt.getTime())) {
    return 'invalidEventAt';
  }

  if (!isValidMetric(values.glucose, DIARY_ENTRY_METRIC_MAXIMUM.glucose)) {
    return 'invalidGlucose';
  }

  if (
    !isValidMetric(values.shortInsulin, DIARY_ENTRY_METRIC_MAXIMUM.shortInsulin)
  ) {
    return 'invalidShortInsulin';
  }

  if (
    !isValidMetric(
      values.ultraShortInsulin,
      DIARY_ENTRY_METRIC_MAXIMUM.ultraShortInsulin
    )
  ) {
    return 'invalidUltraShortInsulin';
  }

  if (
    !isValidMetric(values.longInsulin, DIARY_ENTRY_METRIC_MAXIMUM.longInsulin)
  ) {
    return 'invalidLongInsulin';
  }

  if (!isValidMetric(values.carbsGram, DIARY_ENTRY_METRIC_MAXIMUM.carbsGram)) {
    return 'invalidCarbsGram';
  }

  if (values.comment.length > DIARY_ENTRY_COMMENT_MAXIMUM_LENGTH) {
    return 'commentTooLong';
  }

  if (!hasMeaningfulContent(values, hasPhoto)) {
    return 'emptyEntry';
  }

  return null;
};
