import type {
  DiaryBackupManifest,
  DiaryBackupRecordsScope,
  DiaryLocalRepository,
} from '@entities/diary';

import {
  DiaryImportValidationError,
  type DiaryValidatedBackupArchive,
} from '../model/diaryBackupValidation';
import type { DiaryImportConflictReviewItem } from '../model/diaryImportConflictReview';

import {
  readDiaryImportChunkEntries,
  resolveDiaryImportPhotoUri,
} from './diaryImportArchiveReader';
import { validateDiaryBackupArchive } from './validateDiaryBackupArchive';

export type DiaryImportSource = {
  fileUri: string;
  fileName: string;
};

export type DiaryImportPreview = {
  fileName: string;

  exportType: DiaryBackupManifest['exportType'];

  exportedAt: string;

  sourceUserName: string;
  sourceUserId: string;

  recordsScope: DiaryBackupRecordsScope;

  entriesCount: number;
  photosCount: number;
  matchesCount: number;
};

export type DiaryPreparedImportSession = {
  archive: DiaryValidatedBackupArchive;

  preview: DiaryImportPreview;

  conflictItems: readonly DiaryImportConflictReviewItem[];

  conflictEntryIds: readonly string[];

  cleanup: () => void;
};

type DiaryImportPreparationProgress = {
  onArchiveValidated?: (manifest: DiaryBackupManifest) => void;

  onConflictScanProgress?: (processedEntries: number) => void;
};

type DiaryImportConflictScanResult = {
  conflictItems: readonly DiaryImportConflictReviewItem[];

  referencedPhotosCount: number;
};

const scanArchiveConflicts = async ({
  archive,
  repository,
  onProgress,
}: {
  archive: DiaryValidatedBackupArchive;

  repository: DiaryLocalRepository;

  onProgress?: (processedEntries: number) => void;
}): Promise<DiaryImportConflictScanResult> => {
  const conflictItems: DiaryImportConflictReviewItem[] = [];

  let referencedPhotosCount = 0;
  let processedEntries = 0;

  for (const relativeChunkPath of archive.manifest.chunks) {
    const entries = await readDiaryImportChunkEntries({
      archive,
      relativePath: relativeChunkPath,
    });

    const backupPhotoUris = new Map<string, string | null>();

    for (const entry of entries) {
      const photoUri = resolveDiaryImportPhotoUri({
        archive,
        entry,
      });

      backupPhotoUris.set(entry.id, photoUri);

      if (photoUri !== null) {
        referencedPhotosCount += 1;
      }
    }

    const localEntries = await repository.findByIds(
      entries.map((entry) => entry.id)
    );

    const localEntriesById = new Map(
      localEntries.map((entry) => [entry.id, entry])
    );

    for (const backupEntry of entries) {
      const localEntry = localEntriesById.get(backupEntry.id);

      if (localEntry === undefined) {
        continue;
      }

      conflictItems.push({
        entryId: backupEntry.id,

        localEntry,
        backupEntry,

        backupPhotoUri: backupPhotoUris.get(backupEntry.id) ?? null,
      });
    }

    processedEntries += entries.length;

    onProgress?.(processedEntries);
  }

  return {
    conflictItems,
    referencedPhotosCount,
  };
};

export class DiaryImportPreparationService {
  public constructor(private readonly repository: DiaryLocalRepository) {}

  public async prepare(
    source: DiaryImportSource,
    progress: DiaryImportPreparationProgress = {}
  ): Promise<DiaryPreparedImportSession> {
    const archive = await validateDiaryBackupArchive({
      fileUri: source.fileUri,
      fileName: source.fileName,
    });

    try {
      progress.onArchiveValidated?.(archive.manifest);

      const { conflictItems, referencedPhotosCount } =
        await scanArchiveConflicts({
          archive,
          repository: this.repository,
          onProgress: progress.onConflictScanProgress,
        });

      if (referencedPhotosCount !== archive.manifest.photosCount) {
        throw new DiaryImportValidationError('manifestInvalid');
      }

      const conflictEntryIds = conflictItems.map((item) => item.entryId);

      const preview: DiaryImportPreview = {
        fileName: archive.sourceFileName,

        exportType: archive.manifest.exportType,

        exportedAt: archive.manifest.exportedAt,

        sourceUserName: archive.manifest.sourceUserName,

        sourceUserId: archive.manifest.sourceUserId,

        recordsScope: archive.manifest.recordsScope,

        entriesCount: archive.manifest.entriesCount,

        photosCount: archive.manifest.photosCount,

        matchesCount: conflictItems.length,
      };

      let active = true;

      const cleanup = (): void => {
        if (!active) {
          return;
        }

        active = false;

        archive.cleanup();
      };

      return {
        archive,
        preview,

        conflictItems,
        conflictEntryIds,

        cleanup,
      };
    } catch (error) {
      archive.cleanup();

      throw error;
    }
  }
}
