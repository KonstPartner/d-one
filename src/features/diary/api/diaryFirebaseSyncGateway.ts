import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { getAuth } from 'firebase/auth';
import { deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
} from 'firebase/storage';

import { app, db } from '@features/auth/api/firebase/config';

import type { DiaryEntry } from '../model/types';

const MAXIMUM_PHOTO_SIZE = 10 * 1024 * 1024;

type CloudPhotoState = Pick<DiaryEntry, 'photoPath' | 'photoUrl'>;

const storage = getStorage(app);

let lastPhotoVersion = 0;

const isStorageObjectMissing = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === 'storage/object-not-found';
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

const createUploadError = ({
  status,
  body,
}: {
  status: number;
  body: string;
}): Error => {
  let serverMessage = body;

  const parsedBody = JSON.parse(body) as {
    error?: { message?: unknown };
  };
  const parsedMessage = parsedBody.error?.message;

  if (typeof parsedMessage === 'string' && parsedMessage.length > 0) {
    serverMessage = parsedMessage;
  }

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
  onProgress,
}: {
  localPhotoUri: string;
  photoPath: string;
  onProgress?: (progress: number) => void;
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
  const photoReference = ref(storage, photoPath);
  const uploadTask = FileSystem.createUploadTask(
    createMediaUploadUrl(photoPath),
    localPhotoUri,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Firebase ${idToken}`,
        'Content-Type': 'image/jpeg',
      },
      httpMethod: 'POST',
      sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    },
    ({ totalBytesExpectedToSend, totalBytesSent }) => {
      const progress =
        totalBytesExpectedToSend <= 0
          ? 0
          : Math.round((totalBytesSent / totalBytesExpectedToSend) * 100);

      onProgress?.(Math.min(Math.max(progress, 0), 100));
    }
  );

  onProgress?.(0);

  const uploadResult = await uploadTask.uploadAsync();

  if (!uploadResult) {
    throw new Error('Firebase Storage upload was cancelled');
  }

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw createUploadError({
      status: uploadResult.status,
      body: uploadResult.body,
    });
  }

  onProgress?.(100);

  return addPhotoVersion(await getDownloadURL(photoReference));
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
