import { beginDiaryTransfer, type DiaryLocalRepository } from '@entities/diary';

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

import { createDiaryCsvFileSession } from './diaryCsvFileService';

type DiaryCsvExportInput = {
  scope: DiaryExportScope;
  exportedAt: Date;
  localization: DiaryCsvLocalization;
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

    const scopeReader = createDiaryExportScopeReader({
      repository: this.repository,
      scope,
    });

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
    });

    let fileSession: ReturnType<typeof createDiaryCsvFileSession> | null = null;

    try {
      const stats = await scopeReader.getStats();

      if (stats.entriesCount === 0) {
        transfer.cancel();

        return null;
      }

      transfer.setTotals({
        totalEntries: stats.entriesCount,
        totalPhotos: 0,
      });

      transfer.setPhase('processing');

      const formatter = createDiaryCsvFormatter(localization);

      fileSession = createDiaryCsvFileSession({
        headerRow: formatter.headerRow,
      });

      const activeFileSession = fileSession;

      let processedEntries = 0;

      await scopeReader.forEachBatch(async (entries) => {
        const rows = entries.map(formatter.formatEntry);

        activeFileSession.append(`${rows.join('\r\n')}\r\n`);

        processedEntries += entries.length;

        transfer.updateProgress({
          processedEntries,
        });
      });

      if (processedEntries !== stats.entriesCount) {
        throw new Error('Diary export scope changed during processing');
      }

      const fileName = buildDiaryExportFileName({
        format: 'csv',
        userName: this.userName,
        exportedAt,
        scope,
      });

      const result = activeFileSession.createResultFile(fileName);

      transfer.complete();

      return {
        fileUri: result.fileUri,
        fileName,
        fileSize: result.fileSize,

        entriesCount: processedEntries,
        photosCount: 0,
        skippedPhotosCount: 0,
      };
    } catch (error) {
      transfer.fail();

      throw error;
    } finally {
      fileSession?.cleanupWorkingFiles();
    }
  }
}
