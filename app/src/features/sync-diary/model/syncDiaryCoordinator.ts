import type { DiaryEntry, DiaryLocalRepository } from '@entities/diary';

import {
  type DiarySyncResult,
  synchronizeDiaryEntry,
} from '../api/synchronizeDiaryEntry';

import {
  activateSyncDiaryUser,
  type DiarySyncBatchType,
  useSyncDiaryStore,
} from './syncDiaryStore';

type QueueEntryInput = {
  userId: string;
  entryId: string;
  repository: DiaryLocalRepository;
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
  repository: DiaryLocalRepository;
  force?: boolean;
};

type QueuePendingInput = {
  userId: string;
  repository: DiaryLocalRepository;
  batchType?: Exclude<DiarySyncBatchType, 'forced'>;
};

type QueueForcedInput = Omit<QueueEntriesInput, 'force'>;

type BatchPassInput = {
  userId: string;
  entryIds: ReadonlyArray<string>;
  repository: DiaryLocalRepository;
  force: boolean;
  operationId: string;
  startIndex: number;
  total: number;
};

const queue: QueueJob[] = [];

const scheduledJobs = new Map<string, QueueJob>();

let queueRunning = false;

let batchSequence: Promise<void> = Promise.resolve();

let nextBatchId = 0;

const createEntryKey = ({
  userId,
  entryId,
}: Pick<QueueEntryInput, 'userId' | 'entryId'>): string =>
  `${userId}:${entryId}`;

const uniqueEntryIds = (
  entryIds: ReadonlyArray<string>
): ReadonlyArray<string> =>
  Array.from(new Set(entryIds.filter((entryId) => entryId.length > 0)));

const assertSynchronizationSucceeded = (
  results: ReadonlyArray<DiarySyncResult>
): void => {
  const failedResult = results.find((result) => result.status === 'failed');

  if (failedResult === undefined) {
    return;
  }

  throw new Error(`Failed to synchronize diary entry: ${failedResult.entryId}`);
};

const synchronizeQueuedEntry = (
  input: QueueEntryInput
): Promise<DiarySyncResult> => synchronizeDiaryEntry(input);

const notifyJobStarted = (job: QueueJob): void => {
  job.state = 'running';

  useSyncDiaryStore.getState().setEntrySyncing({
    userId: job.input.userId,
    entryId: job.input.entryId,
    active: true,
  });

  job.startObservers.forEach((observer) => {
    observer();
  });
};

const notifyJobFinished = (job: QueueJob): void => {
  useSyncDiaryStore.getState().setEntrySyncing({
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
        result = await synchronizeQueuedEntry(job.input);
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

  const startObservers = new Set<() => void>();

  if (onStart !== undefined) {
    startObservers.add(onStart);
  }

  const job: QueueJob = {
    key,
    input,
    promise: jobPromise,
    resolve: resolveJob,
    state: 'queued',
    startObservers,
  };

  scheduledJobs.set(key, job);

  queue.push(job);

  void drainQueue();

  return jobPromise;
};

const queueBatchPass = async ({
  userId,
  entryIds,
  repository,
  force,
  operationId,
  startIndex,
  total,
}: BatchPassInput): Promise<DiarySyncResult[]> => {
  const results: DiarySyncResult[] = [];

  for (const [index, entryId] of entryIds.entries()) {
    const result = await enqueueEntry(
      {
        userId,
        entryId,
        repository,
        force,
      },
      () => {
        useSyncDiaryStore.getState().updateBatchProgress({
          userId,
          operationId,
          current: startIndex + index + 1,
          total,
        });
      }
    );

    results.push(result);

    if (result.status === 'failed') {
      break;
    }
  }

  return results;
};

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

    photoPath: entry.photoPath,

    photoUrl: entry.photoUrl,

    eventAt: entry.eventAt.toISOString(),

    syncStatus: entry.syncStatus,
  });
};

const readEntryFingerprints = async (
  repository: DiaryLocalRepository,
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
  repository,
  originalIds,
  originalFingerprints,
}: {
  repository: DiaryLocalRepository;
  originalIds: ReadonlySet<string>;
  originalFingerprints: ReadonlyMap<string, string | null>;
}): Promise<ReadonlyArray<string>> => {
  const pendingIds = uniqueEntryIds(await repository.findPendingIds());

  const currentFingerprints = await readEntryFingerprints(
    repository,
    pendingIds
  );

  return pendingIds.filter((entryId) => {
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
  activateSyncDiaryUser(userId);

  const originalEntryIds = uniqueEntryIds(await repository.findPendingIds());

  if (originalEntryIds.length === 0) {
    return [];
  }

  const operationId = `diary-sync-batch-${++nextBatchId}`;

  const originalFingerprints = await readEntryFingerprints(
    repository,
    originalEntryIds
  );

  useSyncDiaryStore.getState().startBatch({
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

    assertSynchronizationSucceeded(firstPassResults);

    const recheckEntryIds = await findRecheckIds({
      repository,

      originalIds: new Set(originalEntryIds),

      originalFingerprints,
    });

    if (recheckEntryIds.length === 0) {
      return firstPassResults;
    }

    const total = originalEntryIds.length + recheckEntryIds.length;

    useSyncDiaryStore.getState().updateBatchProgress({
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

    assertSynchronizationSucceeded(secondPassResults);

    return batchResults;
  } finally {
    useSyncDiaryStore.getState().finishBatch({
      userId,
      operationId,
    });
  }
};

const runForcedBatch = async ({
  userId,
  entryIds,
  repository,
}: QueueForcedInput): Promise<DiarySyncResult[]> => {
  activateSyncDiaryUser(userId);

  const availableEntryIds = uniqueEntryIds(entryIds);

  if (availableEntryIds.length === 0) {
    return [];
  }

  const operationId = `diary-sync-batch-${++nextBatchId}`;

  useSyncDiaryStore.getState().startBatch({
    userId,
    operationId,
    type: 'forced',
    total: availableEntryIds.length,
  });

  try {
    const results = await queueBatchPass({
      userId,
      entryIds: availableEntryIds,
      repository,
      force: true,
      operationId,
      startIndex: 0,
      total: availableEntryIds.length,
    });

    assertSynchronizationSucceeded(results);

    return results;
  } finally {
    useSyncDiaryStore.getState().finishBatch({
      userId,
      operationId,
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

export const queueDiaryEntriesForSync = async ({
  userId,
  entryIds,
  repository,
  force = false,
}: QueueEntriesInput): Promise<DiarySyncResult[]> => {
  activateSyncDiaryUser(userId);

  const results: DiarySyncResult[] = [];

  for (const entryId of uniqueEntryIds(entryIds)) {
    const result = await enqueueEntry({
      userId,
      entryId,
      repository,
      force,
    });

    results.push(result);

    if (result.status === 'failed') {
      break;
    }
  }

  assertSynchronizationSucceeded(results);

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
