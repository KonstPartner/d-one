import type { DiaryBackupEntry, DiaryLocalRepository } from '@entities/diary';
import {
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
} from '@entities/diary';

import type { DiaryImportConflictPlan } from '../model/useDiaryImportConflicts';
import { getDiaryImportConflictPlanDecision } from '../model/useDiaryImportConflicts';

import {
  readDiaryImportChunkEntries,
  resolveDiaryImportPhotoUri,
} from './diaryImportArchiveReader';
import type { DiaryPreparedImportSession } from './DiaryImportPreparationService';

export type DiaryImportExecutionResult = {
  totalEntries: number;
  processedEntries: number;

  addedEntries: number;
  replacedEntries: number;
  skippedEntries: number;
};

export type DiaryImportExecutionProgress = {
  processedEntries: number;
  processedPhotos: number;
};

type DiaryImportExecutionOutcome =
  | {
      status: 'completed';
      result: DiaryImportExecutionResult;
    }
  | {
      status: 'failed';
      result: DiaryImportExecutionResult;
      error: Error;
    };

type PreparedFileOperation = {
  finalize: () => void;
  rollback: () => void;
};

type ImportedBatchOperation = {
  type: 'insert' | 'replace';
  entry: {
    id: string;

    glucose: number | null;
    mealRelation: DiaryBackupEntry['mealRelation'];

    shortInsulin: number | null;
    longInsulin: number | null;
    carbsGram: number | null;

    comment: string;
    aiAnalysis: string;

    localPhotoUri: string | null;
    photoPath: string | null;
    photoUrl: string | null;

    eventAt: Date;
  };
};

type PreparedChunk = {
  databaseOperations: ImportedBatchOperation[];
  fileOperations: PreparedFileOperation[];

  addedEntries: number;
  replacedEntries: number;
  skippedEntries: number;

  processedPhotos: number;
};

const createInitialResult = (
  totalEntries: number
): DiaryImportExecutionResult => ({
  totalEntries,
  processedEntries: 0,

  addedEntries: 0,
  replacedEntries: 0,
  skippedEntries: 0,
});

const toError = (error: unknown): Error =>
  error instanceof Error
    ? error
    : new Error('Unknown diary import execution error');

const getEntryEventAt = (entry: DiaryBackupEntry): Date => {
  const eventAt = new Date(entry.eventAt);

  if (Number.isNaN(eventAt.getTime())) {
    throw new Error('Invalid imported diary entry date');
  }

  return eventAt;
};

const rollbackFileOperations = (
  operations: readonly PreparedFileOperation[]
): void => {
  for (let index = operations.length - 1; index >= 0; index -= 1) {
    try {
      operations[index]?.rollback();
    } catch {
      continue;
    }
  }
};

const finalizeFileOperations = (
  operations: readonly PreparedFileOperation[]
): void => {
  for (const operation of operations) {
    try {
      operation.finalize();
    } catch {
      continue;
    }
  }
};

const countBackupPhotos = (entries: readonly DiaryBackupEntry[]): number =>
  entries.reduce(
    (count, entry) => (entry.photoFileName === null ? count : count + 1),
    0
  );

export class DiaryImportExecutionService {
  public constructor(
    private readonly repository: DiaryLocalRepository,
    private readonly userId: string
  ) {}

  private prepareAppliedEntry({
    session,
    entry,
    type,
    fileOperations,
  }: {
    session: DiaryPreparedImportSession;
    entry: DiaryBackupEntry;
    type: 'insert' | 'replace';
    fileOperations: PreparedFileOperation[];
  }): ImportedBatchOperation {
    const sourcePhotoUri = resolveDiaryImportPhotoUri({
      archive: session.archive,
      entry,
    });

    let localPhotoUri: string | null = null;
    let photoPath: string | null = null;

    if (sourcePhotoUri !== null) {
      const preparedPhoto = prepareDiaryPhotoForEntry({
        userId: this.userId,
        entryId: entry.id,
        draftUri: sourcePhotoUri,
      });

      fileOperations.push(preparedPhoto);

      localPhotoUri = preparedPhoto.localPhotoUri;
      photoPath = preparedPhoto.photoPath;
    } else if (type === 'replace') {
      fileOperations.push(
        prepareDiaryPhotoRemoval({
          userId: this.userId,
          entryId: entry.id,
        })
      );
    }

    return {
      type,
      entry: {
        id: entry.id,

        glucose: entry.glucose,
        mealRelation: entry.mealRelation,
        shortInsulin: entry.shortInsulin,
        longInsulin: entry.longInsulin,
        carbsGram: entry.carbsGram,

        comment: entry.comment,
        aiAnalysis: entry.aiAnalysis,

        localPhotoUri,
        photoPath,
        photoUrl: entry.photoUrl,

        eventAt: getEntryEventAt(entry),
      },
    };
  }

  private prepareChunk({
    session,
    entries,
    conflictEntryIdSet,
    conflictPlan,
  }: {
    session: DiaryPreparedImportSession;
    entries: readonly DiaryBackupEntry[];

    conflictEntryIdSet: ReadonlySet<string>;
    conflictPlan: DiaryImportConflictPlan;
  }): PreparedChunk {
    const databaseOperations: ImportedBatchOperation[] = [];
    const fileOperations: PreparedFileOperation[] = [];

    let addedEntries = 0;
    let replacedEntries = 0;
    let skippedEntries = 0;

    try {
      for (const entry of entries) {
        if (conflictEntryIdSet.has(entry.id)) {
          const decision = getDiaryImportConflictPlanDecision({
            plan: conflictPlan,
            entryId: entry.id,
          });

          if (decision === null) {
            throw new Error(`Unresolved diary import conflict: ${entry.id}`);
          }

          if (decision === 'skip') {
            skippedEntries += 1;
            continue;
          }

          databaseOperations.push(
            this.prepareAppliedEntry({
              session,
              entry,
              type: 'replace',
              fileOperations,
            })
          );

          replacedEntries += 1;
          continue;
        }

        databaseOperations.push(
          this.prepareAppliedEntry({
            session,
            entry,
            type: 'insert',
            fileOperations,
          })
        );

        addedEntries += 1;
      }

      return {
        databaseOperations,
        fileOperations,

        addedEntries,
        replacedEntries,
        skippedEntries,

        processedPhotos: countBackupPhotos(entries),
      };
    } catch (error) {
      rollbackFileOperations(fileOperations);
      throw error;
    }
  }

  public async execute({
    session,
    conflictPlan,
    onProgress,
  }: {
    session: DiaryPreparedImportSession;
    conflictPlan: DiaryImportConflictPlan;
    onProgress?: (progress: DiaryImportExecutionProgress) => void;
  }): Promise<DiaryImportExecutionOutcome> {
    const result = createInitialResult(session.archive.manifest.entriesCount);

    const conflictEntryIdSet = new Set(session.conflictEntryIds);

    for (const entryId of session.conflictEntryIds) {
      if (
        getDiaryImportConflictPlanDecision({
          plan: conflictPlan,
          entryId,
        }) === null
      ) {
        return {
          status: 'failed',
          result,
          error: new Error(
            `Diary import conflict plan is incomplete: ${entryId}`
          ),
        };
      }
    }

    let processedPhotos = 0;

    try {
      for (const relativeChunkPath of session.archive.manifest.chunks) {
        const entries = await readDiaryImportChunkEntries({
          archive: session.archive,
          relativePath: relativeChunkPath,
        });

        const prepared = this.prepareChunk({
          session,
          entries,
          conflictEntryIdSet,
          conflictPlan,
        });

        try {
          if (prepared.databaseOperations.length > 0) {
            await this.repository.applyImportedBatch(
              prepared.databaseOperations
            );
          }
        } catch (error) {
          rollbackFileOperations(prepared.fileOperations);
          throw error;
        }

        finalizeFileOperations(prepared.fileOperations);

        result.processedEntries += entries.length;
        result.addedEntries += prepared.addedEntries;
        result.replacedEntries += prepared.replacedEntries;
        result.skippedEntries += prepared.skippedEntries;

        processedPhotos += prepared.processedPhotos;

        onProgress?.({
          processedEntries: result.processedEntries,
          processedPhotos,
        });
      }

      return {
        status: 'completed',
        result,
      };
    } catch (error) {
      return {
        status: 'failed',
        result,
        error: toError(error),
      };
    }
  }
}
