import {
  beginDiaryTransfer,
  createDiaryBackupEntry,
  createDiaryStoredExportTargetUri,
  DIARY_BACKUP_APP,
  DIARY_BACKUP_FORMAT_VERSION,
  type DiaryBackupEntry,
  type DiaryBackupManifest,
  type DiaryEntry,
  type DiaryLocalRepository,
  listDiaryStoredExportFiles,
} from '@entities/diary';

import { buildDiaryExportFileName } from '../lib/buildDiaryExportFileName';
import { createDiaryExportScopeReader } from '../model/createDiaryExportScopeReader';
import type {
  DiaryExportResult,
  DiaryExportScope,
} from '../model/diaryExport.types';
import {
  DIARY_EXPORT_WORK_VERSION,
  type DiaryExportWorkState,
} from '../model/diaryExportWorkState';

import { createDiaryBackupFileSession } from './diaryBackupFileService';
import {
  createDiaryExportWork,
  createDiaryExportWorkId,
  deleteDiaryExportWork,
  getDiaryExportWorkPayloadUri,
  listDiaryExportWorkStates,
  readDiaryExportWorkPlanChunk,
  readDiaryExportWorkState,
  writeDiaryExportWorkPlanChunk,
  writeDiaryExportWorkState,
} from './diaryExportWorkStorage';

type DiaryBackupExportFormat = 'fullBackup' | 'lightweightBackup';

type DiaryBackupExportInput = {
  format: DiaryBackupExportFormat;
  scope: DiaryExportScope;
  exportedAt: Date;
};

const isExportableEntry = (entry: DiaryEntry): boolean =>
  entry.syncStatus !== 'pendingDelete';

const createScopeFromWorkState = (
  state: DiaryExportWorkState
): DiaryExportScope => {
  switch (state.recordsScope.type) {
    case 'all':
      return {
        type: 'all',
      };

    case 'period':
      return {
        type: 'period',
        from: new Date(state.recordsScope.from),
        to: new Date(state.recordsScope.to),
      };

    case 'selected':
      if (
        state.phase !== 'planning' ||
        state.planningSelectedEntryIds === null
      ) {
        throw new Error('Diary selected export planning state is incomplete');
      }

      return {
        type: 'selected',
        entryIds: [...state.planningSelectedEntryIds],
      };
  }
};

const orderEntriesByPlan = ({
  entries,
  entryIds,
}: {
  entries: readonly DiaryEntry[];
  entryIds: readonly string[];
}): DiaryEntry[] => {
  const byId = new Map(
    entries.filter(isExportableEntry).map((entry) => [entry.id, entry] as const)
  );

  return entryIds.flatMap((entryId) => {
    const entry = byId.get(entryId);

    return entry ? [entry] : [];
  });
};

export class DiaryBackupExportService {
  public constructor(
    private readonly userId: string,
    private readonly userName: string,
    private readonly repository: DiaryLocalRepository
  ) {}

  public async export({
    format,
    scope,
    exportedAt,
  }: DiaryBackupExportInput): Promise<DiaryExportResult | null> {
    if (this.userId.length === 0) {
      throw new Error('Invalid diary export user');
    }

    if (Number.isNaN(exportedAt.getTime())) {
      throw new Error('Invalid diary export date');
    }

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
    });

    let exportId: string | null = null;

    try {
      transfer.setPhase('validating');

      const scopeReader = createDiaryExportScopeReader({
        repository: this.repository,
        scope,
      });

      const fileName = buildDiaryExportFileName({
        format,
        userName: this.userName,
        exportedAt,
        scope,
      });

      createDiaryStoredExportTargetUri(fileName);

      if (
        listDiaryExportWorkStates().some((state) => state.fileName === fileName)
      ) {
        throw new Error('Diary export work already exists');
      }

      exportId = createDiaryExportWorkId();

      const planningSelectedEntryIds =
        scope.type === 'selected' ? Array.from(new Set(scope.entryIds)) : null;

      let state: DiaryExportWorkState = {
        version: DIARY_EXPORT_WORK_VERSION,

        exportId,
        userId: this.userId,
        userName: this.userName,

        format,
        fileName,
        exportedAt: exportedAt.toISOString(),

        recordsScope: scopeReader.recordsScope,

        phase: 'planning',

        planningSelectedEntryIds,

        totalEntries: 0,
        totalPhotos: 0,

        planChunksCount: 0,
        completedPlanChunks: 0,

        processedEntries: 0,
        processedPhotos: 0,

        photosCount: 0,
        skippedPhotosCount: 0,

        backupChunks: [],
      };

      createDiaryExportWork(state);

      state = await this.buildPlan({
        state,
        scopeReader,
      });

      if (state.totalEntries === 0) {
        deleteDiaryExportWork(state.exportId);
        transfer.cancel();

        return null;
      }

      return await this.processAndFinalize({
        state,
        transfer,
      });
    } catch (error) {
      transfer.fail();

      throw error;
    }
  }

  public async resume(exportId: string): Promise<DiaryExportResult | null> {
    const initialState = readDiaryExportWorkState(exportId);

    if (initialState.userId !== this.userId || initialState.format === 'csv') {
      throw new Error('Diary export work does not belong to this backup');
    }

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
      totalEntries: initialState.totalEntries,
      totalPhotos: initialState.totalPhotos,
    });

    try {
      let state = initialState;

      if (state.phase === 'planning') {
        transfer.setPhase('validating');

        const scope = createScopeFromWorkState(state);

        const scopeReader = createDiaryExportScopeReader({
          repository: this.repository,
          scope,
        });

        state = await this.buildPlan({
          state,
          scopeReader,
        });

        if (state.totalEntries === 0) {
          deleteDiaryExportWork(state.exportId);
          transfer.cancel();

          return null;
        }
      }

      return await this.processAndFinalize({
        state,
        transfer,
      });
    } catch (error) {
      transfer.fail();

      throw error;
    }
  }

  private async buildPlan({
    state,
    scopeReader,
  }: {
    state: DiaryExportWorkState;
    scopeReader: ReturnType<typeof createDiaryExportScopeReader>;
  }): Promise<DiaryExportWorkState> {
    let planChunksCount = 0;
    let totalEntries = 0;
    let totalPhotos = 0;

    await scopeReader.forEachBatch(async (entries) => {
      planChunksCount += 1;

      writeDiaryExportWorkPlanChunk(state.exportId, {
        chunkNumber: planChunksCount,
        entryIds: entries.map((entry) => entry.id),
      });

      totalEntries += entries.length;

      if (state.format === 'fullBackup') {
        totalPhotos += entries.reduce(
          (count, entry) => count + (entry.localPhotoUri === null ? 0 : 1),
          0
        );
      }
    });

    const plannedState: DiaryExportWorkState = {
      ...state,

      recordsScope: scopeReader.recordsScope,

      phase: 'processing',

      planningSelectedEntryIds: null,

      totalEntries,
      totalPhotos,

      planChunksCount,
      completedPlanChunks: 0,

      processedEntries: 0,
      processedPhotos: 0,

      photosCount: 0,
      skippedPhotosCount: 0,

      backupChunks: [],
    };

    writeDiaryExportWorkState(plannedState);

    return plannedState;
  }

  private async processAndFinalize({
    state: initialState,
    transfer,
  }: {
    state: DiaryExportWorkState;
    transfer: Awaited<ReturnType<typeof beginDiaryTransfer>>;
  }): Promise<DiaryExportResult> {
    let state = initialState;

    transfer.setTotals({
      totalEntries: state.totalEntries,
      totalPhotos: state.totalPhotos,
    });

    transfer.updateProgress({
      processedEntries: state.processedEntries,
      processedPhotos: state.processedPhotos,
    });

    const payloadUri = getDiaryExportWorkPayloadUri(state.exportId);

    const fileSession = createDiaryBackupFileSession({
      payloadUri,
    });

    try {
      if (state.phase === 'processing') {
        transfer.setPhase('processing');

        for (
          let planChunkNumber = state.completedPlanChunks + 1;
          planChunkNumber <= state.planChunksCount;
          planChunkNumber += 1
        ) {
          const planChunk = readDiaryExportWorkPlanChunk(
            state.exportId,
            planChunkNumber
          );

          fileSession.resetBatch({
            chunkNumber: planChunkNumber,
            entryIds: planChunk.entryIds,
          });

          const entries = orderEntriesByPlan({
            entries: await this.repository.findByIds(planChunk.entryIds),
            entryIds: planChunk.entryIds,
          });

          const backupEntries: DiaryBackupEntry[] = [];
          let batchProcessedPhotos = 0;
          let batchPhotosCount = 0;
          let batchSkippedPhotosCount = 0;

          for (const entry of entries) {
            let photoFileName: string | null = null;

            if (state.format === 'fullBackup' && entry.localPhotoUri !== null) {
              batchProcessedPhotos += 1;

              photoFileName = fileSession.addLocalPhoto({
                entryId: entry.id,
                localPhotoUri: entry.localPhotoUri,
              });

              if (photoFileName === null) {
                batchSkippedPhotosCount += 1;
              } else {
                batchPhotosCount += 1;
              }
            }

            backupEntries.push(
              createDiaryBackupEntry({
                entry,
                photoFileName,
              })
            );
          }

          let backupChunks = state.backupChunks;

          if (backupEntries.length > 0) {
            const chunkPath = fileSession.writeEntriesChunk({
              chunkNumber: planChunkNumber,
              entries: backupEntries,
            });

            backupChunks = [...backupChunks, chunkPath];
          }

          const processedEntries =
            state.processedEntries + backupEntries.length;

          const processedPhotos = state.processedPhotos + batchProcessedPhotos;

          const totalPhotos = Math.max(state.totalPhotos, processedPhotos);

          const nextState: DiaryExportWorkState = {
            ...state,

            totalPhotos,

            completedPlanChunks: planChunkNumber,

            processedEntries,
            processedPhotos,

            photosCount: state.photosCount + batchPhotosCount,

            skippedPhotosCount:
              state.skippedPhotosCount + batchSkippedPhotosCount,

            backupChunks,
          };

          writeDiaryExportWorkState(nextState);

          state = nextState;

          transfer.setTotals({
            totalEntries: state.totalEntries,
            totalPhotos: state.totalPhotos,
          });

          transfer.updateProgress({
            processedEntries: state.processedEntries,
            processedPhotos: state.processedPhotos,
          });
        }

        state = {
          ...state,

          phase: 'readyToFinalize',

          totalEntries: state.processedEntries,
          totalPhotos: state.processedPhotos,
        };

        writeDiaryExportWorkState(state);
      }

      if (state.phase !== 'readyToFinalize') {
        throw new Error('Diary export work cannot be finalized');
      }

      transfer.setTotals({
        totalEntries: state.processedEntries,
        totalPhotos: state.processedPhotos,
      });

      transfer.updateProgress({
        processedEntries: state.processedEntries,
        processedPhotos: state.processedPhotos,
      });

      const existingFile = listDiaryStoredExportFiles().find(
        (file) => file.kind === 'backup' && file.fileName === state.fileName
      );

      if (existingFile !== undefined) {
        deleteDiaryExportWork(state.exportId);
        transfer.complete();

        return {
          fileUri: existingFile.fileUri,
          fileName: existingFile.fileName,
          fileSize: existingFile.fileSize,

          entriesCount: state.processedEntries,
          photosCount: state.photosCount,
          skippedPhotosCount: state.skippedPhotosCount,
        };
      }

      const exportedAt = new Date(state.exportedAt);

      if (Number.isNaN(exportedAt.getTime())) {
        throw new Error('Diary export work date is invalid');
      }

      const manifest: DiaryBackupManifest =
        state.format === 'fullBackup'
          ? {
              app: DIARY_BACKUP_APP,
              formatVersion: DIARY_BACKUP_FORMAT_VERSION,
              exportType: 'fullBackup',
              exportedAt: exportedAt.toISOString(),

              sourceUserName: state.userName,
              sourceUserId: state.userId,

              entriesCount: state.processedEntries,
              photosCount: state.photosCount,
              withPhotos: true,

              recordsScope: state.recordsScope,

              chunks: state.backupChunks,
            }
          : {
              app: DIARY_BACKUP_APP,
              formatVersion: DIARY_BACKUP_FORMAT_VERSION,
              exportType: 'lightweightBackup',
              exportedAt: exportedAt.toISOString(),

              sourceUserName: state.userName,
              sourceUserId: state.userId,

              entriesCount: state.processedEntries,
              photosCount: 0,
              withPhotos: false,

              recordsScope: state.recordsScope,

              chunks: state.backupChunks,
            };

      fileSession.writeManifest(manifest);

      const archive = await fileSession.createArchive(state.fileName);

      deleteDiaryExportWork(state.exportId);

      transfer.complete();

      return {
        fileUri: archive.fileUri,
        fileName: state.fileName,
        fileSize: archive.fileSize,

        entriesCount: state.processedEntries,
        photosCount: state.photosCount,
        skippedPhotosCount: state.skippedPhotosCount,
      };
    } finally {
      fileSession.cleanupWorkingFiles();
    }
  }
}
