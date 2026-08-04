import { queryClient } from '@features/shared/api';

import {
  activateDiarySyncUser,
  type DiarySyncBatchType,
  useDiarySyncStore,
} from '../model/diarySyncStore';
import { useDiaryListStore } from '../model/store';
import type { DiaryEntry } from '../model/types';

import { diaryQueryKeys } from './constants';
import { prepareDiaryPhotoRemoval } from './diaryPhotoService';
import type { DiaryRepository } from './sqlite/diaryRepository';

type QueueEntryInput = {
  userId: string;
  entryId: string;
  repository: DiaryRepository;
  force: boolean;
};

type QueueJob = {
  key: string;
  input: QueueEntryInput;
  promise: Promise<DiarySyncResult>;
  resolve: (result: DiarySyncResult) => void;
  state: 'queued' | 'running';
  startObservers: Set<() => void>;
};

type QueueEntriesInput = {
  userId: string;
  entryIds: ReadonlyArray<string>;
  repository: DiaryRepository;
  force?: boolean;
};

type QueuePendingInput = {
  userId: string;
  repository: DiaryRepository;
  batchType?: Exclude<DiarySyncBatchType, 'forced'>;
};

type QueueForcedInput = Omit<QueueEntriesInput, 'force'>;

type PreparingEntryInput = {
  userId: string;
  entryId: string;
};

type CloudPhotoState = Pick<DiaryEntry, 'photoPath' | 'photoUrl'>;

type BatchPassInput = {
  userId: string;
  entryIds: ReadonlyArray<string>;
  repository: DiaryRepository;
  force: boolean;
  operationId: string;
  startIndex: number;
  total: number;
};

export type DiarySyncResult = {
  entryId: string;
  status: 'synced' | 'deleted' | 'skipped' | 'failed';
};

const queue: QueueJob[] = [];
const scheduledJobs = new Map<string, QueueJob>();

let queueRunning = false;
let batchSequence = Promise.resolve();
let nextBatchId = 0;
let cloudGatewayPromise: Promise<
  typeof import('./diaryFirebaseSyncGateway')
> | null = null;

const getCloudGateway = (): Promise<
  typeof import('./diaryFirebaseSyncGateway')
> => {
  cloudGatewayPromise ??= import('./diaryFirebaseSyncGateway');

  return cloudGatewayPromise;
};

const createEntryKey = ({ userId, entryId }: PreparingEntryInput): string =>
  `${userId}:${entryId}`;

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
  repository: DiaryRepository;
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
  repository: DiaryRepository;
  force: boolean;
}): Promise<void> => {
  const photoState = await synchronizePhotoState({
    entry,
    repository,
    force,
  });

  await upsertCloudEntry({
    entry,
    photoState,
  });

  await repository.markSynced(entry.id);
};

const synchronizeDeletion = async ({
  entry,
  repository,
}: {
  entry: DiaryEntry;
  repository: DiaryRepository;
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

const isEntryPreparing = (userId: string, entryId: string): boolean => {
  const state = useDiarySyncStore.getState();

  return state.activeUserId === userId && state.preparingEntryIds.has(entryId);
};

const synchronizeEntry = async (
  input: QueueEntryInput
): Promise<DiarySyncResult> => {
  if (isEntryPreparing(input.userId, input.entryId)) {
    return {
      entryId: input.entryId,
      status: 'skipped',
    };
  }

  const entry = await input.repository.findById(input.entryId);

  if (entry === null) {
    return {
      entryId: input.entryId,
      status: 'skipped',
    };
  }

  assertEntryOwnership(entry, input.userId);

  if (entry.syncStatus === 'pendingDelete') {
    await synchronizeDeletion({
      entry,
      repository: input.repository,
    });

    return {
      entryId: input.entryId,
      status: 'deleted',
    };
  }

  if (entry.syncStatus === 'synced' && !input.force) {
    return {
      entryId: input.entryId,
      status: 'skipped',
    };
  }

  await synchronizeUpsert({
    entry,
    repository: input.repository,
    force: input.force,
  });

  return {
    entryId: input.entryId,
    status: 'synced',
  };
};

const notifyJobStarted = (job: QueueJob): void => {
  job.state = 'running';
  useDiarySyncStore.getState().setEntrySyncing({
    userId: job.input.userId,
    entryId: job.input.entryId,
    active: true,
  });
  job.startObservers.forEach((observer) => observer());
};

const notifyJobFinished = (job: QueueJob): void => {
  useDiarySyncStore.getState().setEntrySyncing({
    userId: job.input.userId,
    entryId: job.input.entryId,
    active: false,
  });
};

const drainQueue = async (): Promise<void> => {
  if (queueRunning) {
    return;
  }

  queueRunning = true;

  try {
    while (queue.length > 0) {
      const job = queue.shift();

      if (job === undefined) {
        continue;
      }

      notifyJobStarted(job);

      let result: DiarySyncResult;

      try {
        result = await synchronizeEntry(job.input);
      } catch (error) {
        console.error(
          `Failed to synchronize diary entry: ${job.input.entryId}`,
          error
        );

        result = {
          entryId: job.input.entryId,
          status: 'failed',
        };
      } finally {
        notifyJobFinished(job);
      }

      scheduledJobs.delete(job.key);
      job.resolve(result);
    }
  } finally {
    queueRunning = false;

    if (queue.length > 0) {
      void drainQueue();
    }
  }
};

const enqueueEntry = (
  input: QueueEntryInput,
  onStart?: () => void
): Promise<DiarySyncResult> => {
  const key = createEntryKey(input);
  const existingJob = scheduledJobs.get(key);

  if (existingJob !== undefined) {
    if (
      input.force &&
      !existingJob.input.force &&
      existingJob.state === 'running'
    ) {
      return existingJob.promise.then(() => enqueueEntry(input, onStart));
    }

    if (input.force && existingJob.state === 'queued') {
      existingJob.input.force = true;
    }

    if (onStart !== undefined) {
      existingJob.startObservers.add(onStart);

      if (existingJob.state === 'running') {
        onStart();
      }
    }

    return existingJob.promise;
  }

  let resolveJob: (result: DiarySyncResult) => void = () => undefined;

  const jobPromise = new Promise<DiarySyncResult>((resolve) => {
    resolveJob = resolve;
  });

  const job: QueueJob = {
    key,
    input,
    promise: jobPromise,
    resolve: resolveJob,
    state: 'queued',
    startObservers: new Set<() => void>(onStart === undefined ? [] : [onStart]),
  };

  scheduledJobs.set(key, job);
  queue.push(job);

  void drainQueue();

  return jobPromise;
};

const uniqueEntryIds = (
  entryIds: ReadonlyArray<string>
): ReadonlyArray<string> =>
  Array.from(new Set(entryIds.filter((entryId) => entryId.length > 0)));

const refreshLocalDiaryAfterSync = async ({
  userId,
  repository,
  results,
}: {
  userId: string;
  repository: DiaryRepository;
  results: ReadonlyArray<DiarySyncResult>;
}): Promise<void> => {
  try {
    if (results.some((result) => result.status === 'deleted')) {
      const currentPage = useDiaryListStore.getState().currentPage;
      const page = await repository.findPage(currentPage);
      const lastPage = Math.max(page.pagination.totalPages, 1);

      if (currentPage > lastPage) {
        useDiaryListStore.getState().setCurrentPage(lastPage);
      }
    }

    await queryClient.invalidateQueries({
      queryKey: diaryQueryKeys.localPagesRoot(userId),
    });
  } catch (error) {
    console.error('Failed to refresh diary after synchronization', error);
  }
};

const queueBatchPass = ({
  userId,
  entryIds,
  repository,
  force,
  operationId,
  startIndex,
  total,
}: BatchPassInput): Promise<DiarySyncResult[]> =>
  Promise.all(
    entryIds.map((entryId, index) =>
      enqueueEntry(
        {
          userId,
          entryId,
          repository,
          force,
        },
        () => {
          useDiarySyncStore.getState().updateBatchProgress({
            userId,
            operationId,
            current: startIndex + index + 1,
            total,
          });
        }
      )
    )
  );

const createEntryFingerprint = (entry: DiaryEntry | null): string | null => {
  if (entry === null) {
    return null;
  }

  return JSON.stringify({
    glucose: entry.glucose,
    mealRelation: entry.mealRelation,
    shortInsulin: entry.shortInsulin,
    longInsulin: entry.longInsulin,
    carbsGram: entry.carbsGram,
    comment: entry.comment,
    aiAnalysis: entry.aiAnalysis,
    localPhotoUri: entry.localPhotoUri,
    eventAt: entry.eventAt.toISOString(),
  });
};

const readEntryFingerprints = async (
  repository: DiaryRepository,
  entryIds: ReadonlyArray<string>
): Promise<Map<string, string | null>> => {
  const entries = await Promise.all(
    entryIds.map((entryId) => repository.findById(entryId))
  );

  return new Map(
    entryIds.map((entryId, index) => [
      entryId,
      createEntryFingerprint(entries[index] ?? null),
    ])
  );
};

const findRecheckIds = async ({
  userId,
  repository,
  originalIds,
  originalFingerprints,
}: {
  userId: string;
  repository: DiaryRepository;
  originalIds: ReadonlySet<string>;
  originalFingerprints: ReadonlyMap<string, string | null>;
}): Promise<ReadonlyArray<string>> => {
  const pendingIds = uniqueEntryIds(await repository.findPendingIds());
  const availableIds = pendingIds.filter(
    (entryId) => !isEntryPreparing(userId, entryId)
  );
  const currentFingerprints = await readEntryFingerprints(
    repository,
    availableIds
  );

  return availableIds.filter((entryId) => {
    if (!originalIds.has(entryId)) {
      return true;
    }

    return (
      currentFingerprints.get(entryId) !== originalFingerprints.get(entryId)
    );
  });
};

const runPendingBatch = async ({
  userId,
  repository,
  batchType,
}: Required<QueuePendingInput>): Promise<DiarySyncResult[]> => {
  activateDiarySyncUser(userId);

  const originalEntryIds = uniqueEntryIds(
    await repository.findPendingIds()
  ).filter((entryId) => !isEntryPreparing(userId, entryId));

  if (originalEntryIds.length === 0) {
    return [];
  }

  const operationId = `diary-sync-batch-${++nextBatchId}`;
  const originalFingerprints = await readEntryFingerprints(
    repository,
    originalEntryIds
  );

  useDiarySyncStore.getState().startBatch({
    userId,
    operationId,
    type: batchType,
    total: originalEntryIds.length,
  });

  let batchResults: DiarySyncResult[] = [];

  try {
    const firstPassResults = await queueBatchPass({
      userId,
      entryIds: originalEntryIds,
      repository,
      force: false,
      operationId,
      startIndex: 0,
      total: originalEntryIds.length,
    });

    batchResults = firstPassResults;

    const recheckEntryIds = await findRecheckIds({
      userId,
      repository,
      originalIds: new Set(originalEntryIds),
      originalFingerprints,
    });

    if (recheckEntryIds.length === 0) {
      return firstPassResults;
    }

    const total = originalEntryIds.length + recheckEntryIds.length;

    useDiarySyncStore.getState().updateBatchProgress({
      userId,
      operationId,
      current: originalEntryIds.length,
      total,
    });

    const secondPassResults = await queueBatchPass({
      userId,
      entryIds: recheckEntryIds,
      repository,
      force: false,
      operationId,
      startIndex: originalEntryIds.length,
      total,
    });

    batchResults = [...firstPassResults, ...secondPassResults];

    return batchResults;
  } finally {
    useDiarySyncStore.getState().finishBatch({
      userId,
      operationId,
    });

    await refreshLocalDiaryAfterSync({
      userId,
      repository,
      results: batchResults,
    });
  }
};

const runForcedBatch = async ({
  userId,
  entryIds,
  repository,
}: QueueForcedInput): Promise<DiarySyncResult[]> => {
  activateDiarySyncUser(userId);

  const availableEntryIds = uniqueEntryIds(entryIds).filter(
    (entryId) => !isEntryPreparing(userId, entryId)
  );

  if (availableEntryIds.length === 0) {
    return [];
  }

  const operationId = `diary-sync-batch-${++nextBatchId}`;

  useDiarySyncStore.getState().startBatch({
    userId,
    operationId,
    type: 'forced',
    total: availableEntryIds.length,
  });

  let batchResults: DiarySyncResult[] = [];

  try {
    batchResults = await queueBatchPass({
      userId,
      entryIds: availableEntryIds,
      repository,
      force: true,
      operationId,
      startIndex: 0,
      total: availableEntryIds.length,
    });

    return batchResults;
  } finally {
    useDiarySyncStore.getState().finishBatch({
      userId,
      operationId,
    });

    await refreshLocalDiaryAfterSync({
      userId,
      repository,
      results: batchResults,
    });
  }
};

const enqueueBatch = <Result>(
  runner: () => Promise<Result>
): Promise<Result> => {
  const result = batchSequence.then(runner, runner);

  batchSequence = result.then(
    () => undefined,
    () => undefined
  );

  return result;
};

export const setDiaryEntryPreparing = ({
  userId,
  entryId,
  preparing,
}: PreparingEntryInput & { preparing: boolean }): void => {
  activateDiarySyncUser(userId);
  useDiarySyncStore.getState().setEntryPreparing({
    userId,
    entryId,
    active: preparing,
  });
};

export const queueDiaryEntriesForSync = async ({
  userId,
  entryIds,
  repository,
  force = false,
}: QueueEntriesInput): Promise<DiarySyncResult[]> => {
  activateDiarySyncUser(userId);

  const results = await Promise.all(
    uniqueEntryIds(entryIds).map((entryId) =>
      enqueueEntry({
        userId,
        entryId,
        repository,
        force,
      })
    )
  );

  await refreshLocalDiaryAfterSync({
    userId,
    repository,
    results,
  });

  return results;
};

export const queuePendingDiaryEntriesForSync = ({
  userId,
  repository,
  batchType = 'automatic',
}: QueuePendingInput): Promise<DiarySyncResult[]> =>
  enqueueBatch(() =>
    runPendingBatch({
      userId,
      repository,
      batchType,
    })
  );

export const queueForcedDiaryEntriesForSync = (
  input: QueueForcedInput
): Promise<DiarySyncResult[]> => enqueueBatch(() => runForcedBatch(input));
