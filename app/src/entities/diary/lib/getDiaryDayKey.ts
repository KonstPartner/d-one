import { dateKit } from '@shared/lib/date';

import type { DiaryDayKey } from '../model/diaryDay';
import type { DiaryEntry } from '../model/diaryEntry';

export const getDiaryDayKey = (eventAt: DiaryEntry['eventAt']): DiaryDayKey => {
  const { year, month, day } = dateKit.formatParts(eventAt);

  return `${year}-${month}-${day}`;
};
