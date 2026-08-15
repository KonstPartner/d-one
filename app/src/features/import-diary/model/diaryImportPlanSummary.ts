import type { DiaryImportPreview } from '../api/DiaryImportPreparationService';

import type { DiaryImportConflictReviewItem } from './diaryImportConflictReview';
import type { DiaryImportConflictPlan } from './useDiaryImportConflicts';

export type DiaryImportPlanSummary = {
  entriesCount: number;

  newEntries: number;
  replacedEntries: number;
  skippedEntries: number;

  photosCount: number;
};

export const getDiaryImportPlanSummary = ({
  preview,
  conflictItems,
  plan,
}: {
  preview: DiaryImportPreview;

  conflictItems: readonly DiaryImportConflictReviewItem[];

  plan: DiaryImportConflictPlan;
}): DiaryImportPlanSummary => {
  if (conflictItems.length !== preview.matchesCount) {
    throw new Error('Diary import conflict summary is inconsistent');
  }

  let replacedEntries = 0;
  let skippedEntries = 0;
  let skippedPhotos = 0;

  if (plan.type === 'all') {
    if (plan.decision === 'replace') {
      replacedEntries = preview.matchesCount;
    } else {
      skippedEntries = preview.matchesCount;

      skippedPhotos = conflictItems.reduce(
        (count, item) =>
          item.backupEntry.photoFileName === null ? count : count + 1,
        0
      );
    }
  } else if (plan.type === 'individual') {
    for (const item of conflictItems) {
      const decision = plan.decisions.get(item.entryId);

      if (decision === undefined) {
        throw new Error(
          `Diary import conflict decision is missing: ${item.entryId}`
        );
      }

      if (decision === 'replace') {
        replacedEntries += 1;

        continue;
      }

      skippedEntries += 1;

      if (item.backupEntry.photoFileName !== null) {
        skippedPhotos += 1;
      }
    }
  }

  const photosCount = preview.photosCount - skippedPhotos;

  if (photosCount < 0) {
    throw new Error('Diary import photo summary is invalid');
  }

  return {
    entriesCount: preview.entriesCount,

    newEntries: preview.entriesCount - preview.matchesCount,

    replacedEntries,
    skippedEntries,

    photosCount,
  };
};
