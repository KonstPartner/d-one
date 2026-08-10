import { type DiaryEntry, isDiarySyncStatus } from '../../model/diaryEntry';
import { isMealRelation } from '../../model/mealRelation';

export type DiaryEntryRow = {
  id: string;
  user_id: string;

  glucose: number | null;
  meal_relation: string | null;
  short_insulin: number | null;
  long_insulin: number | null;
  carbs_gram: number | null;

  comment: string;
  ai_analysis: string;

  local_photo_uri: string | null;
  photo_path: string | null;
  photo_url: string | null;

  event_at: number;

  sync_status: string;
};

export const mapDiaryEntryRow = (row: DiaryEntryRow): DiaryEntry => {
  if (row.meal_relation !== null && !isMealRelation(row.meal_relation)) {
    throw new Error(`Invalid diary meal relation: ${row.meal_relation}`);
  }

  if (!isDiarySyncStatus(row.sync_status)) {
    throw new Error(`Invalid diary synchronization status: ${row.sync_status}`);
  }

  const eventAt = new Date(row.event_at);

  if (Number.isNaN(eventAt.getTime())) {
    throw new Error(`Invalid diary event date: ${row.event_at}`);
  }

  return {
    id: row.id,
    userId: row.user_id,

    glucose: row.glucose,
    mealRelation: row.meal_relation,
    shortInsulin: row.short_insulin,
    longInsulin: row.long_insulin,
    carbsGram: row.carbs_gram,

    comment: row.comment,
    aiAnalysis: row.ai_analysis,

    localPhotoUri: row.local_photo_uri,
    photoPath: row.photo_path,
    photoUrl: row.photo_url,

    eventAt,

    syncStatus: row.sync_status,
  };
};
