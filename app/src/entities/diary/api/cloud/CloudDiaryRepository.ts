import {
  collection,
  documentId,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from 'firebase/firestore';

import { auth, db } from '@shared/api';

import type {
  CloudDiaryCursor,
  CloudDiaryPageResult,
} from '../../model/cloudDiaryPage';
import {
  CLOUD_DIARY_PAGE_SIZE,
  CLOUD_DIARY_QUERY_LIMIT,
} from '../../model/cloudDiaryPage';

import { parseCloudDiaryEntry } from './parseCloudDiaryEntry';

const validateCursor = (cursor: CloudDiaryCursor): void => {
  if (!Number.isFinite(cursor.eventAtMs) || cursor.id.length === 0) {
    throw new Error('UNKNOWN_ERROR');
  }
};

export class CloudDiaryRepository {
  public constructor(private readonly ownerUid: string) {}

  public async findPage(
    cursor: CloudDiaryCursor | null = null
  ): Promise<CloudDiaryPageResult> {
    if (auth.currentUser === null) {
      throw new Error('UNAUTHENTICATED');
    }

    if (this.ownerUid.length === 0) {
      throw new Error('UNKNOWN_ERROR');
    }

    if (cursor !== null) {
      validateCursor(cursor);
    }

    const entries = collection(db, 'users', this.ownerUid, 'diaryEntries');

    const pageQuery =
      cursor === null
        ? query(
            entries,
            orderBy('eventAt', 'desc'),
            orderBy(documentId(), 'desc'),
            limit(CLOUD_DIARY_QUERY_LIMIT)
          )
        : query(
            entries,
            orderBy('eventAt', 'desc'),
            orderBy(documentId(), 'desc'),
            startAfter(Timestamp.fromMillis(cursor.eventAtMs), cursor.id),
            limit(CLOUD_DIARY_QUERY_LIMIT)
          );

    const snapshot = await getDocsFromServer(pageQuery);

    const hasNextPage = snapshot.docs.length > CLOUD_DIARY_PAGE_SIZE;

    const visibleDocuments = snapshot.docs.slice(0, CLOUD_DIARY_PAGE_SIZE);

    const items = visibleDocuments.map((document) =>
      parseCloudDiaryEntry({
        documentId: document.id,
        ownerUid: this.ownerUid,
        data: document.data(),
      })
    );

    const lastEntry = items.length > 0 ? items[items.length - 1] : null;

    const nextCursor =
      hasNextPage && lastEntry !== null
        ? {
            eventAtMs: lastEntry.eventAt.getTime(),
            id: lastEntry.id,
          }
        : null;

    return {
      items,

      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }
}
