import {
  beginDiaryTransfer,
  createDiaryStoredExportTargetUri,
  type DiaryEntry,
  type DiaryLocalRepository,
  listDiaryStoredExportFiles,
} from '@entities/diary';

import { buildDiaryExportFileName } from '../lib/buildDiaryExportFileName';
import { createDiaryExportScopeReader } from '../model/createDiaryExportScopeReader';
import {
  createDiaryCsvFormatter,
  type DiaryCsvLocalization,
} from '../model/diaryCsv';
import type {
  DiaryExportResult,
  DiaryExportScope,
} from '../model/diaryExport.types';
import {
  DIARY_EXPORT_WORK_VERSION,
  type DiaryExportWorkState,
} from '../model/diaryExportWorkState';

import { createDiaryCsvFileSession } from './diaryCsvFileService';
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

type DiaryCsvExportInput = {
  scope: DiaryExportScope;
  exportedAt: Date;
  localization: DiaryCsvLocalization;
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
        throw new Error(
          'Diary selected CSV export planning state is incomplete'
        );
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

const getCsvLocalization = (
  state: DiaryExportWorkState
): DiaryCsvLocalization => {
  if (
    state.format !== 'csv' ||
    state.csvLocalization === null ||
    state.csvLocalization === undefined
  ) {
    throw new Error('Diary CSV export localization is missing');
  }

  return state.csvLocalization;
};

export class DiaryCsvExportService {
  public constructor(
    private readonly userId: string,
    private readonly userName: string,
    private readonly repository: DiaryLocalRepository
  ) {}

  public async export({
    scope,
    exportedAt,
    localization,
  }: DiaryCsvExportInput): Promise<DiaryExportResult | null> {
    if (this.userId.length === 0) {
      throw new Error('Invalid diary export user');
    }

    if (Number.isNaN(exportedAt.getTime())) {
      throw new Error('Invalid diary export date');
    }

    createDiaryCsvFormatter(localization);

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
    });

    try {
      transfer.setPhase('validating');

      const scopeReader = createDiaryExportScopeReader({
        repository: this.repository,
        scope,
      });

      const fileName = buildDiaryExportFileName({
        format: 'csv',
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

      const exportId = createDiaryExportWorkId();

      const planningSelectedEntryIds =
        scope.type === 'selected' ? Array.from(new Set(scope.entryIds)) : null;

      let state: DiaryExportWorkState = {
        version: DIARY_EXPORT_WORK_VERSION,

        exportId,
        userId: this.userId,
        userName: this.userName,

        format: 'csv',
        fileName,
        exportedAt: exportedAt.toISOString(),

        recordsScope: scopeReader.recordsScope,

        phase: 'planning',

        planningSelectedEntryIds,

        csvLocalization: localization,

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

    if (initialState.userId !== this.userId || initialState.format !== 'csv') {
      throw new Error('Diary export work does not belong to this CSV export');
    }

    getCsvLocalization(initialState);

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
      totalEntries: initialState.totalEntries,
      totalPhotos: 0,
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

    await scopeReader.forEachBatch(async (entries) => {
      planChunksCount += 1;

      writeDiaryExportWorkPlanChunk(state.exportId, {
        chunkNumber: planChunksCount,
        entryIds: entries.map((entry) => entry.id),
      });

      totalEntries += entries.length;
    });

    const plannedState: DiaryExportWorkState = {
      ...state,

      recordsScope: scopeReader.recordsScope,

      phase: 'processing',

      planningSelectedEntryIds: null,

      totalEntries,
      totalPhotos: 0,

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

    const formatter = createDiaryCsvFormatter(getCsvLocalization(state));

    transfer.setTotals({
      totalEntries: state.totalEntries,
      totalPhotos: 0,
    });

    transfer.updateProgress({
      processedEntries: state.processedEntries,
      processedPhotos: 0,
    });

    const fileSession = createDiaryCsvFileSession({
      payloadUri: getDiaryExportWorkPayloadUri(state.exportId),
      headerRow: formatter.headerRow,
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

          fileSession.resetChunk(planChunkNumber);

          const entries = orderEntriesByPlan({
            entries: await this.repository.findByIds(planChunk.entryIds),
            entryIds: planChunk.entryIds,
          });

          fileSession.writeRowsChunk({
            chunkNumber: planChunkNumber,
            rows: entries.map(formatter.formatEntry),
          });

          const nextState: DiaryExportWorkState = {
            ...state,

            completedPlanChunks: planChunkNumber,

            processedEntries: state.processedEntries + entries.length,
          };

          writeDiaryExportWorkState(nextState);

          state = nextState;

          transfer.updateProgress({
            processedEntries: state.processedEntries,
          });
        }

        state = {
          ...state,

          phase: 'readyToFinalize',

          totalEntries: state.processedEntries,
        };

        writeDiaryExportWorkState(state);
      }

      if (state.phase !== 'readyToFinalize') {
        throw new Error('Diary CSV export work cannot be finalized');
      }

      transfer.setTotals({
        totalEntries: state.processedEntries,
        totalPhotos: 0,
      });

      transfer.updateProgress({
        processedEntries: state.processedEntries,
        processedPhotos: 0,
      });

      const existingFile = listDiaryStoredExportFiles().find(
        (file) => file.kind === 'csv' && file.fileName === state.fileName
      );

      if (existingFile !== undefined) {
        deleteDiaryExportWork(state.exportId);
        transfer.complete();

        return {
          fileUri: existingFile.fileUri,
          fileName: existingFile.fileName,
          fileSize: existingFile.fileSize,

          entriesCount: state.processedEntries,
          photosCount: 0,
          skippedPhotosCount: 0,
        };
      }

      const result = fileSession.createResultFile({
        fileName: state.fileName,
        chunksCount: state.planChunksCount,
      });

      deleteDiaryExportWork(state.exportId);

      transfer.complete();

      return {
        fileUri: result.fileUri,
        fileName: state.fileName,
        fileSize: result.fileSize,

        entriesCount: state.processedEntries,
        photosCount: 0,
        skippedPhotosCount: 0,
      };
    } finally {
      fileSession.cleanupWorkingFiles();
    }
  }
}
