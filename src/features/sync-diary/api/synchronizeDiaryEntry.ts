import {
  type DiaryEntry,
  type DiaryLocalRepository,
  prepareDiaryPhotoRemoval,
} from '@entities/diary';

type CloudPhotoState = Pick<DiaryEntry, 'photoPath' | 'photoUrl'>;

type SynchronizeDiaryEntryInput = {
  userId: string;
  entryId: string;
  repository: DiaryLocalRepository;
  force: boolean;
};

export type DiarySyncResult = {
  entryId: string;

  status: 'synced' | 'stale' | 'deleted' | 'skipped' | 'failed';
};

let cloudGatewayPromise: Promise<
  typeof import('./diaryFirebaseSyncGateway')
> | null = null;

const getCloudGateway = (): Promise<
  typeof import('./diaryFirebaseSyncGateway')
> => {
  cloudGatewayPromise ??= import('./diaryFirebaseSyncGateway');

  return cloudGatewayPromise;
};

const getExpectedPhotoPath = (userId: string, entryId: string): string =>
  `users/${userId}/diaryPhotos/${entryId}.jpg`;

const assertEntryOwnership = (entry: DiaryEntry, userId: string): void => {
  if (entry.userId !== userId) {
    throw new Error('Diary entry owner does not match the active user');
  }
};

const assertExpectedPhotoPath = (
  photoPath: string | null,
  userId: string,
  entryId: string
): void => {
  if (
    photoPath !== null &&
    photoPath !== getExpectedPhotoPath(userId, entryId)
  ) {
    throw new Error('Unexpected diary photo path');
  }
};

const deleteStorageObjectIfExists = async (
  photoPath: string
): Promise<void> => {
  const { deleteDiaryCloudPhoto } = await getCloudGateway();

  await deleteDiaryCloudPhoto(photoPath);
};

const uploadDiaryPhoto = async ({
  localPhotoUri,
  photoPath,
}: {
  localPhotoUri: string;
  photoPath: string;
}): Promise<string> => {
  const { uploadDiaryCloudPhoto } = await getCloudGateway();

  return uploadDiaryCloudPhoto({
    localPhotoUri,
    photoPath,
  });
};

const synchronizePhotoState = async ({
  entry,
  repository,
  force,
}: {
  entry: DiaryEntry;
  repository: DiaryLocalRepository;
  force: boolean;
}): Promise<CloudPhotoState> => {
  assertExpectedPhotoPath(entry.photoPath, entry.userId, entry.id);

  if (entry.localPhotoUri !== null) {
    if (entry.photoPath === null) {
      throw new Error('Local diary photo does not have a Storage path');
    }

    if (!force && entry.photoUrl !== null) {
      return {
        photoPath: entry.photoPath,

        photoUrl: entry.photoUrl,
      };
    }

    const photoUrl = await uploadDiaryPhoto({
      localPhotoUri: entry.localPhotoUri,

      photoPath: entry.photoPath,
    });

    await repository.updatePendingPhotoState({
      id: entry.id,

      photoPath: entry.photoPath,

      photoUrl,
    });

    return {
      photoPath: entry.photoPath,

      photoUrl,
    };
  }

  if (entry.photoPath !== null && entry.photoUrl === null) {
    await deleteStorageObjectIfExists(entry.photoPath);

    await repository.updatePendingPhotoState({
      id: entry.id,

      photoPath: null,

      photoUrl: null,
    });

    return {
      photoPath: null,

      photoUrl: null,
    };
  }

  return {
    photoPath: entry.photoPath,

    photoUrl: entry.photoUrl,
  };
};

const upsertCloudEntry = async ({
  entry,
  photoState,
}: {
  entry: DiaryEntry;
  photoState: CloudPhotoState;
}): Promise<void> => {
  const { upsertDiaryCloudEntry } = await getCloudGateway();

  await upsertDiaryCloudEntry({
    entry,
    photoState,
  });
};

const synchronizeUpsert = async ({
  entry,
  repository,
  force,
}: {
  entry: DiaryEntry;
  repository: DiaryLocalRepository;
  force: boolean;
}): Promise<boolean> => {
  const photoState = await synchronizePhotoState({
    entry,
    repository,
    force,
  });

  await upsertCloudEntry({
    entry,
    photoState,
  });

  return repository.markSyncedIfUnchanged({
    ...entry,

    photoPath: photoState.photoPath,

    photoUrl: photoState.photoUrl,
  });
};

const synchronizeDeletion = async ({
  entry,
  repository,
}: {
  entry: DiaryEntry;
  repository: DiaryLocalRepository;
}): Promise<void> => {
  assertExpectedPhotoPath(entry.photoPath, entry.userId, entry.id);

  const { deleteDiaryCloudEntry } = await getCloudGateway();

  await deleteDiaryCloudEntry({
    userId: entry.userId,

    entryId: entry.id,
  });

  if (entry.photoPath !== null) {
    await deleteStorageObjectIfExists(entry.photoPath);
  }

  const preparedPhotoRemoval = prepareDiaryPhotoRemoval({
    userId: entry.userId,

    entryId: entry.id,
  });

  try {
    await repository.deletePending(entry.id);

    preparedPhotoRemoval.finalize();
  } catch (error) {
    preparedPhotoRemoval.rollback();

    throw error;
  }
};

export const synchronizeDiaryEntry = async ({
  userId,
  entryId,
  repository,
  force,
}: SynchronizeDiaryEntryInput): Promise<DiarySyncResult> => {
  const entry = await repository.findById(entryId);

  if (entry === null) {
    return {
      entryId,
      status: 'skipped',
    };
  }

  assertEntryOwnership(entry, userId);

  if (entry.syncStatus === 'pendingDelete') {
    await synchronizeDeletion({
      entry,
      repository,
    });

    return {
      entryId,
      status: 'deleted',
    };
  }

  if (entry.syncStatus === 'synced' && !force) {
    return {
      entryId,
      status: 'skipped',
    };
  }

  const markedSynced = await synchronizeUpsert({
    entry,
    repository,
    force,
  });

  return {
    entryId,

    status: markedSynced ? 'synced' : 'stale',
  };
};
