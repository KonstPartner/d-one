import type { DiaryEntryEditableValues } from '@entities/diary';

export type CreateDiaryEntryDraft = {
  values: DiaryEntryEditableValues;
  useCurrentDateTime: boolean;
  changed: boolean;
};

const createInitialCreateDiaryEntryValues = (): DiaryEntryEditableValues => {
  const eventAt = new Date();

  eventAt.setSeconds(0, 0);

  return {
    glucose: null,
    mealRelation: null,
    shortInsulin: null,
    ultraShortInsulin: null,
    longInsulin: null,
    carbsGram: null,
    comment: '',
    eventAt,
  };
};

export const createInitialCreateDiaryEntryDraft =
  (): CreateDiaryEntryDraft => ({
    values: createInitialCreateDiaryEntryValues(),

    useCurrentDateTime: true,

    changed: false,
  });
