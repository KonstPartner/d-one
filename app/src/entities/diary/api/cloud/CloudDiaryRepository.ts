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

import { CloudDiaryError, type CloudDiaryErrorCode } from './CloudDiaryError';
import {
  InvalidCloudDiaryEntryError,
  parseCloudDiaryEntry,
} from './parseCloudDiaryEntry';

const getFirebaseErrorCode = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = (
    error as {
      code?: unknown;
    }
  ).code;

  if (typeof code !== 'string') {
    return null;
  }

  return code.replace(/^firestore\//, '');
};

const mapFirebaseErrorCode = (code: string | null): CloudDiaryErrorCode => {
  switch (code) {
    case 'unauthenticated':
      return 'UNAUTHENTICATED';

    case 'permission-denied':
      return 'ACCESS_DENIED';

    case 'unavailable':
    case 'deadline-exceeded':
      return 'NETWORK_ERROR';

    case 'failed-precondition':
      return 'QUERY_CONFIGURATION_ERROR';

    default:
      return 'UNKNOWN_ERROR';
  }
};

const mapCloudDiaryError = (error: unknown): CloudDiaryError => {
  if (error instanceof CloudDiaryError) {
    return error;
  }

  if (error instanceof InvalidCloudDiaryEntryError) {
    return new CloudDiaryError('INVALID_CLOUD_DATA');
  }

  return new CloudDiaryError(mapFirebaseErrorCode(getFirebaseErrorCode(error)));
};

const validateCursor = (cursor: CloudDiaryCursor): void => {
  if (!Number.isFinite(cursor.eventAtMs) || cursor.id.length === 0) {
    throw new CloudDiaryError('UNKNOWN_ERROR');
  }
};

export class CloudDiaryRepository {
  public constructor(private readonly ownerUid: string) {}

  public async findPage(
    cursor: CloudDiaryCursor | null = null
  ): Promise<CloudDiaryPageResult> {
    try {
      if (auth.currentUser === null) {
        throw new CloudDiaryError('UNAUTHENTICATED');
      }

      if (this.ownerUid.length === 0) {
        throw new CloudDiaryError('UNKNOWN_ERROR');
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
    } catch (error) {
      throw mapCloudDiaryError(error);
    }
  }
}
