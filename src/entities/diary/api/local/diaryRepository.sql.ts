export const DIARY_PAGE_SIZE = 30;

const MUTABLE_SYNC_STATUSES_SQL = "'synced', 'pendingCreate', 'pendingUpdate'";

export const CREATE_DIARY_ENTRY_SQL = `
  INSERT INTO diary_entries (
    id,
    user_id,
    glucose,
    meal_relation,
    short_insulin,
    long_insulin,
    carbs_gram,
    comment,
    ai_analysis,
    local_photo_uri,
    photo_path,
    photo_url,
    event_at,
    sync_status
  )
  VALUES (
    $id,
    $userId,
    $glucose,
    $mealRelation,
    $shortInsulin,
    $longInsulin,
    $carbsGram,
    $comment,
    $aiAnalysis,
    $localPhotoUri,
    $photoPath,
    $photoUrl,
    $eventAt,
    $syncStatus
  )
`;

export const DIARY_ENTRY_SELECT_SQL = `
  SELECT
    id,
    user_id,
    glucose,
    meal_relation,
    short_insulin,
    long_insulin,
    carbs_gram,
    comment,
    ai_analysis,
    local_photo_uri,
    photo_path,
    photo_url,
    event_at,
    sync_status
  FROM diary_entries
`;

export const FIND_DIARY_ENTRY_BY_ID_SQL = `
  ${DIARY_ENTRY_SELECT_SQL}
  WHERE id = $id
    AND user_id = $userId
  LIMIT 1
`;

export const FIND_PENDING_DIARY_ENTRY_IDS_SQL = `
  SELECT id
  FROM diary_entries
  WHERE user_id = $userId
    AND sync_status IN (
      'pendingCreate',
      'pendingUpdate',
      'pendingDelete'
    )
  ORDER BY event_at DESC, id DESC
`;

export const UPDATE_DIARY_ENTRY_SQL = `
  UPDATE diary_entries
  SET
    glucose = $glucose,
    meal_relation = $mealRelation,
    short_insulin = $shortInsulin,
    long_insulin = $longInsulin,
    carbs_gram = $carbsGram,
    comment = $comment,
    event_at = $eventAt,
    sync_status = CASE sync_status
      WHEN 'pendingCreate' THEN 'pendingCreate'
      ELSE 'pendingUpdate'
    END
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN (
      ${MUTABLE_SYNC_STATUSES_SQL}
    )
`;

export const UPDATE_DIARY_ENTRY_WITH_PHOTO_SQL = `
  UPDATE diary_entries
  SET
    glucose = $glucose,
    meal_relation = $mealRelation,
    short_insulin = $shortInsulin,
    long_insulin = $longInsulin,
    carbs_gram = $carbsGram,
    comment = $comment,
    local_photo_uri = $localPhotoUri,
    photo_path = $photoPath,
    photo_url = $photoUrl,
    event_at = $eventAt,
    sync_status = CASE sync_status
      WHEN 'pendingCreate' THEN 'pendingCreate'
      ELSE 'pendingUpdate'
    END
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN (
      ${MUTABLE_SYNC_STATUSES_SQL}
    )
`;

export const UPDATE_PENDING_PHOTO_STATE_SQL = `
  UPDATE diary_entries
  SET
    photo_path = $photoPath,
    photo_url = $photoUrl
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN (
      ${MUTABLE_SYNC_STATUSES_SQL}
    )
`;

export const MARK_DIARY_ENTRY_SYNCED_SQL = `
  UPDATE diary_entries
  SET sync_status = 'synced'
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN (
      ${MUTABLE_SYNC_STATUSES_SQL}
    )
`;

export const DELETE_PENDING_DIARY_ENTRY_SQL = `
  DELETE FROM diary_entries
  WHERE id = $id
    AND user_id = $userId
    AND sync_status = 'pendingDelete'
`;

export const buildMarkDiaryEntriesPendingDeleteSql = (
  entriesList: string
): string => `
  UPDATE diary_entries
  SET sync_status = 'pendingDelete'
  WHERE user_id = $userId
    AND id IN (${entriesList})
    AND sync_status IN (
      ${MUTABLE_SYNC_STATUSES_SQL}
    )
    AND (
      SELECT COUNT(*)
      FROM diary_entries
      WHERE user_id = $userId
        AND id IN (${entriesList})
        AND sync_status IN (
          ${MUTABLE_SYNC_STATUSES_SQL}
        )
    ) = $expectedCount
`;

export const buildCountDiaryEntriesSql = (whereSql: string): string => `
  SELECT COUNT(*) AS total_items
  FROM diary_entries
  ${whereSql}
`;

export const buildFindDiaryPageSql = (whereSql: string): string => `
  ${DIARY_ENTRY_SELECT_SQL}
  ${whereSql}
  ORDER BY event_at DESC, id DESC
  LIMIT $limit OFFSET $offset
`;
