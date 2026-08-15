import {
  deleteDiaryStoredExportFiles,
  type DiaryLocalRepository,
  type DiaryStoredExportFile,
  listDiaryStoredExportFiles,
} from '@entities/diary';

import type {
  DiaryExportRequest,
  DiaryExportResult,
} from '../model/diaryExport.types';
import {
  deleteDiaryUnfinishedExport,
  type DiaryUnfinishedExport,
  listDiaryUnfinishedExports,
} from '../model/diaryUnfinishedExport';

import { DiaryBackupExportService } from './DiaryBackupExportService';
import { DiaryCsvExportService } from './DiaryCsvExportService';
import { readDiaryExportWorkState } from './diaryExportWorkStorage';

export class DiaryExportService {
  public constructor(
    private readonly userId: string,
    private readonly repository: DiaryLocalRepository
  ) {}

  public export(
    request: DiaryExportRequest
  ): Promise<DiaryExportResult | null> {
    const exportedAt = new Date();

    switch (request.format) {
      case 'fullBackup':
      case 'lightweightBackup':
        return new DiaryBackupExportService(
          this.userId,
          request.userName,
          this.repository
        ).export({
          format: request.format,
          scope: request.scope,
          exportedAt,
        });

      case 'csv':
        return new DiaryCsvExportService(
          this.userId,
          request.userName,
          this.repository
        ).export({
          scope: request.scope,
          exportedAt,
          localization: request.localization,
        });
    }
  }

  public resume(exportId: string): Promise<DiaryExportResult | null> {
    const state = readDiaryExportWorkState(exportId);

    if (state.userId !== this.userId) {
      throw new Error('Diary export work belongs to another user');
    }

    switch (state.format) {
      case 'fullBackup':
      case 'lightweightBackup':
        return new DiaryBackupExportService(
          this.userId,
          state.userName,
          this.repository
        ).resume(exportId);

      case 'csv':
        return new DiaryCsvExportService(
          this.userId,
          state.userName,
          this.repository
        ).resume(exportId);
    }
  }

  public listFinished(): DiaryStoredExportFile[] {
    return listDiaryStoredExportFiles();
  }

  public listUnfinished(): DiaryUnfinishedExport[] {
    return listDiaryUnfinishedExports(this.userId);
  }

  public deleteFinished(fileNames: readonly string[]): void {
    deleteDiaryStoredExportFiles(fileNames);
  }

  public deleteUnfinished(exportId: string): void {
    deleteDiaryUnfinishedExport({
      userId: this.userId,
      exportId,
    });
  }
}
