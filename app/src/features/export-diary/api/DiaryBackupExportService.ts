import {
  beginDiaryTransfer,
  createDiaryBackupEntry,
  DIARY_BACKUP_APP,
  DIARY_BACKUP_FORMAT_VERSION,
  type DiaryBackupManifest,
  type DiaryLocalRepository,
} from '@entities/diary';

import { buildDiaryExportFileName } from '../lib/buildDiaryExportFileName';
import { createDiaryExportScopeReader } from '../model/createDiaryExportScopeReader';
import type {
  DiaryExportResult,
  DiaryExportScope,
} from '../model/diaryExport.types';

import { createDiaryBackupFileSession } from './diaryBackupFileService';

type DiaryBackupExportFormat = 'fullBackup' | 'lightweightBackup';

type DiaryBackupExportInput = {
  format: DiaryBackupExportFormat;
  scope: DiaryExportScope;
  exportedAt: Date;
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

    const scopeReader = createDiaryExportScopeReader({
      repository: this.repository,
      scope,
    });

    const transfer = await beginDiaryTransfer({
      userId: this.userId,
      type: 'export',
    });

    let fileSession: ReturnType<typeof createDiaryBackupFileSession> | null =
      null;

    try {
      const stats = await scopeReader.getStats();

      if (stats.entriesCount === 0) {
        transfer.cancel();

        return null;
      }

      const totalPhotos = format === 'fullBackup' ? stats.localPhotosCount : 0;

      transfer.setTotals({
        totalEntries: stats.entriesCount,
        totalPhotos,
      });

      transfer.setPhase('processing');

      fileSession = createDiaryBackupFileSession();

      const activeFileSession = fileSession;

      const chunks: string[] = [];

      let chunkNumber = 0;

      let processedEntries = 0;
      let processedPhotos = 0;

      let photosCount = 0;
      let skippedPhotosCount = 0;

      await scopeReader.forEachBatch(async (entries) => {
        const backupEntries = entries.map((entry) => {
          let photoFileName: string | null = null;

          if (format === 'fullBackup' && entry.localPhotoUri !== null) {
            photoFileName = activeFileSession.addLocalPhoto({
              entryId: entry.id,
              localPhotoUri: entry.localPhotoUri,
            });

            processedPhotos += 1;

            if (photoFileName === null) {
              skippedPhotosCount += 1;
            } else {
              photosCount += 1;
            }

            transfer.updateProgress({
              processedPhotos,
            });
          }

          return createDiaryBackupEntry({
            entry,
            photoFileName,
          });
        });

        chunkNumber += 1;

        chunks.push(
          activeFileSession.writeEntriesChunk({
            chunkNumber,
            entries: backupEntries,
          })
        );

        processedEntries += entries.length;

        transfer.updateProgress({
          processedEntries,
        });
      });

      if (processedEntries !== stats.entriesCount) {
        throw new Error('Diary export scope changed during processing');
      }

      const manifest: DiaryBackupManifest =
        format === 'fullBackup'
          ? {
              app: DIARY_BACKUP_APP,
              formatVersion: DIARY_BACKUP_FORMAT_VERSION,
              exportType: 'fullBackup',
              exportedAt: exportedAt.toISOString(),

              sourceUserName: this.userName,
              sourceUserId: this.userId,

              entriesCount: processedEntries,
              photosCount,
              withPhotos: true,

              recordsScope: scopeReader.recordsScope,

              chunks,
            }
          : {
              app: DIARY_BACKUP_APP,
              formatVersion: DIARY_BACKUP_FORMAT_VERSION,
              exportType: 'lightweightBackup',
              exportedAt: exportedAt.toISOString(),

              sourceUserName: this.userName,
              sourceUserId: this.userId,

              entriesCount: processedEntries,
              photosCount: 0,
              withPhotos: false,

              recordsScope: scopeReader.recordsScope,

              chunks,
            };

      activeFileSession.writeManifest(manifest);

      const fileName = buildDiaryExportFileName({
        format,
        userName: this.userName,
        exportedAt,
        scope,
      });

      const archive = await activeFileSession.createArchive(fileName);

      transfer.complete();

      return {
        fileUri: archive.fileUri,
        fileName,
        fileSize: archive.fileSize,

        entriesCount: processedEntries,
        photosCount,
        skippedPhotosCount,
      };
    } catch (error) {
      transfer.fail();

      throw error;
    } finally {
      fileSession?.cleanupWorkingFiles();
    }
  }
}
