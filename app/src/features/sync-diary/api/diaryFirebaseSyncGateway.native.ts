import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { getAuth } from 'firebase/auth';
import { deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
} from 'firebase/storage';

import type { DiaryEntry } from '@entities/diary';
import { app, db } from '@shared/api';

const MAXIMUM_PHOTO_SIZE = 10 * 1024 * 1024;

const PHOTO_UPLOAD_TIMEOUT_MS = 60_000;

type CloudPhotoState = Pick<DiaryEntry, 'photoPath' | 'photoUrl'>;

const storage = getStorage(app);

let lastPhotoVersion = 0;

const isStorageObjectMissing = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  return (
    (
      error as {
        code?: unknown;
      }
    ).code === 'storage/object-not-found'
  );
};

const createPhotoVersion = (): number => {
  lastPhotoVersion = Math.max(Date.now(), lastPhotoVersion + 1);

  return lastPhotoVersion;
};

const addPhotoVersion = (downloadUrl: string): string => {
  const separator = downloadUrl.includes('?') ? '&' : '?';

  return `${downloadUrl}${separator}v=${createPhotoVersion()}`;
};

const getStorageBucket = (): string => {
  const storageBucket = app.options.storageBucket;

  if (typeof storageBucket !== 'string' || storageBucket.length === 0) {
    throw new Error('Firebase Storage bucket is not configured');
  }

  return storageBucket.replace(/^gs:\/\//, '').replace(/\/+$/, '');
};

const createMediaUploadUrl = (photoPath: string): string => {
  const bucket = encodeURIComponent(getStorageBucket());

  const objectName = encodeURIComponent(photoPath);

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${objectName}`;
};

const readUploadErrorMessage = (body: string): string => {
  if (body.length === 0) {
    return '';
  }

  try {
    const parsedBody = JSON.parse(body) as {
      error?: {
        message?: unknown;
      };
    };

    const parsedMessage = parsedBody.error?.message;

    return typeof parsedMessage === 'string' && parsedMessage.length > 0
      ? parsedMessage
      : body;
  } catch {
    return body;
  }
};

const createUploadError = ({
  status,
  body,
}: {
  status: number;
  body: string;
}): Error => {
  const serverMessage = readUploadErrorMessage(body);

  const suffix = serverMessage.length > 0 ? `: ${serverMessage}` : '';

  return new Error(`Firebase Storage upload failed (${status})${suffix}`);
};

export const deleteDiaryCloudPhoto = async (
  photoPath: string
): Promise<void> => {
  try {
    await deleteObject(ref(storage, photoPath));
  } catch (error) {
    if (!isStorageObjectMissing(error)) {
      throw error;
    }
  }
};

export const uploadDiaryCloudPhoto = async ({
  localPhotoUri,
  photoPath,
}: {
  localPhotoUri: string;
  photoPath: string;
}): Promise<string> => {
  const photoFile = new File(localPhotoUri);

  if (
    !photoFile.exists ||
    photoFile.size <= 0 ||
    photoFile.size > MAXIMUM_PHOTO_SIZE
  ) {
    throw new Error('Local diary photo is unavailable or invalid');
  }

  const currentUser = getAuth(app).currentUser;

  if (currentUser === null) {
    throw new Error('Firebase user is not authenticated');
  }

  const idToken = await currentUser.getIdToken();

  const controller = new AbortController();

  let uploadTimedOut = false;

  const timeoutId = setTimeout(() => {
    uploadTimedOut = true;

    controller.abort();
  }, PHOTO_UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(createMediaUploadUrl(photoPath), {
      method: 'POST',

      headers: {
        Accept: 'application/json',

        Authorization: `Firebase ${idToken}`,

        'Content-Type': 'image/jpeg',
      },

      body: await photoFile.bytes(),

      signal: controller.signal,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw createUploadError({
        status: response.status,

        body: responseBody,
      });
    }
  } catch (error) {
    if (uploadTimedOut) {
      throw new Error('Firebase Storage upload timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const downloadUrl = await getDownloadURL(ref(storage, photoPath));

  return addPhotoVersion(downloadUrl);
};

export const upsertDiaryCloudEntry = async ({
  entry,
  photoState,
}: {
  entry: DiaryEntry;

  photoState: CloudPhotoState;
}): Promise<void> => {
  await setDoc(doc(db, 'users', entry.userId, 'diaryEntries', entry.id), {
    id: entry.id,

    userId: entry.userId,

    glucose: entry.glucose,

    mealRelation: entry.mealRelation,

    shortInsulin: entry.shortInsulin,

    ultraShortInsulin: entry.ultraShortInsulin,

    longInsulin: entry.longInsulin,

    carbsGram: entry.carbsGram,

    comment: entry.comment,

    aiAnalysis: entry.aiAnalysis,

    photoPath: photoState.photoPath,

    photoUrl: photoState.photoUrl,

    eventAt: Timestamp.fromDate(entry.eventAt),
  });
};

export const deleteDiaryCloudEntry = async ({
  userId,
  entryId,
}: {
  userId: string;
  entryId: string;
}): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'diaryEntries', entryId));
};
