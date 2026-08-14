import { Timestamp } from 'firebase/firestore';

import type { CloudDiaryEntry } from '../../model/cloudDiaryEntry';
import { isMealRelation, type MealRelation } from '../../model/mealRelation';

const AI_ANALYSIS_MAXIMUM_LENGTH = 2000;

type ParseCloudDiaryEntryParams = {
  documentId: string;
  ownerUid: string;
  data: unknown;
};

export class InvalidCloudDiaryEntryError extends Error {
  public constructor() {
    super('Invalid cloud diary entry');
    this.name = 'InvalidCloudDiaryEntryError';
  }
}

const invalidEntry = (): never => {
  throw new InvalidCloudDiaryEntryError();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseNullableNumber = (value: unknown): number | null => {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'number') {
    return invalidEntry();
  }

  return value;
};

const parseNullableString = (value: unknown): string | null => {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return invalidEntry();
  }

  return value;
};

const parseMealRelation = (value: unknown): MealRelation | null => {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string' || !isMealRelation(value)) {
    return invalidEntry();
  }

  return value;
};

export const parseCloudDiaryEntry = ({
  documentId,
  ownerUid,
  data,
}: ParseCloudDiaryEntryParams): CloudDiaryEntry => {
  if (!isRecord(data)) {
    return invalidEntry();
  }

  if (typeof data.id !== 'string' || data.id !== documentId) {
    return invalidEntry();
  }

  if (typeof data.userId !== 'string' || data.userId !== ownerUid) {
    return invalidEntry();
  }

  if (!(data.eventAt instanceof Timestamp)) {
    return invalidEntry();
  }

  if (typeof data.comment !== 'string') {
    return invalidEntry();
  }

  if (
    typeof data.aiAnalysis !== 'string' ||
    data.aiAnalysis.length > AI_ANALYSIS_MAXIMUM_LENGTH
  ) {
    return invalidEntry();
  }

  return {
    id: data.id,
    userId: data.userId,

    glucose: parseNullableNumber(data.glucose),

    mealRelation: parseMealRelation(data.mealRelation),

    shortInsulin: parseNullableNumber(data.shortInsulin),

    longInsulin: parseNullableNumber(data.longInsulin),

    carbsGram: parseNullableNumber(data.carbsGram),

    comment: data.comment,
    aiAnalysis: data.aiAnalysis,

    photoPath: parseNullableString(data.photoPath),

    photoUrl: parseNullableString(data.photoUrl),

    eventAt: data.eventAt.toDate(),
  };
};
