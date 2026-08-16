import {
  beginDiaryTransfer,
  CLOUD_DIARY_PAGE_SIZE,
  type CloudDiaryEntry,
  type DiaryEntry,
  type DiaryLocalRepository,
  type DiaryTransferLease,
  prepareDiaryPhotoRemoval,
} from '@entities/diary';

import type {
  CloudDiaryDownloadConflict,
  CloudDiaryDownloadResolutionMap,
  CloudDiaryDownloadSession,
  DownloadCloudEntriesResult,
} from '../model/cloudDiaryDownload.types';

type CloudDiaryDownloadRepository = Pick<
  DiaryLocalRepository,
  'findByIds' | 'insertSynced' | 'replaceSynced'
>;

type DownloadEntryOutcome = keyof DownloadCloudEntriesResult;

type CloudDiaryDownloadServiceParams = {
  userId: string;
  repository: CloudDiaryDownloadRepository;

  onCommitted?: () => void | Promise<void>;
};

const createEmptyResult = (): DownloadCloudEntriesResult => ({
  added: 0,
  replaced: 0,
  skipped: 0,
  failed: 0,
});

const cloneCloudEntry = (entry: CloudDiaryEntry): CloudDiaryEntry => ({
  ...entry,

  eventAt: new Date(entry.eventAt.getTime()),
});

const validateCloudEntries = ({
  userId,
  entries,
}: {
  userId: string;
  entries: readonly CloudDiaryEntry[];
}): void => {
  if (
    userId.length === 0 ||
    entries.length === 0 ||
    entries.length > CLOUD_DIARY_PAGE_SIZE
  ) {
    throw new Error('Invalid cloud diary download request');
  }

  const entryIds = new Set<string>();

  for (const entry of entries) {
    if (
      entry.id.length === 0 ||
      entry.userId !== userId ||
      Number.isNaN(entry.eventAt.getTime()) ||
      entryIds.has(entry.id)
    ) {
      throw new Error('Invalid cloud diary download entry');
    }

    entryIds.add(entry.id);
  }
};

const createSyncedEntryInput = (entry: CloudDiaryEntry) => ({
  id: entry.id,

  glucose: entry.glucose,

  mealRelation: entry.mealRelation,

  shortInsulin: entry.shortInsulin,

  ultraShortInsulin: entry.ultraShortInsulin,

  longInsulin: entry.longInsulin,

  carbsGram: entry.carbsGram,

  comment: entry.comment,

  aiAnalysis: entry.aiAnalysis,

  localPhotoUri: null,

  photoPath: entry.photoPath,

  photoUrl: entry.photoUrl,

  eventAt: entry.eventAt,
});

const cleanupReplacedLocalPhoto = ({
  userId,
  localEntry,
}: {
  userId: string;
  localEntry: DiaryEntry;
}): void => {
  if (localEntry.localPhotoUri === null) {
    return;
  }

  try {
    const removal = prepareDiaryPhotoRemoval({
      userId,

      entryId: localEntry.id,
    });

    removal.finalize();
  } catch (error) {
    console.error(
      `Failed to remove replaced diary photo: ${localEntry.id}`,
      error
    );
  }
};

class CloudDiaryDownloadSessionImpl implements CloudDiaryDownloadSession {
  private closed = false;

  public constructor(
    private readonly userId: string,

    private readonly repository: CloudDiaryDownloadRepository,

    private readonly entries: readonly CloudDiaryEntry[],

    private readonly localEntriesById: ReadonlyMap<string, DiaryEntry>,

    public readonly conflicts: readonly CloudDiaryDownloadConflict[],

    private readonly transfer: DiaryTransferLease,

    private readonly onCommitted: () => void | Promise<void>
  ) {}

  private assertActive(): void {
    if (this.closed) {
      throw new Error('Cloud diary download session is not active');
    }
  }

  private validateResolutions(
    resolutions: CloudDiaryDownloadResolutionMap
  ): void {
    for (const conflict of this.conflicts) {
      if (!resolutions.has(conflict.cloudEntry.id)) {
        throw new Error(
          `Cloud diary conflict is unresolved: ${conflict.cloudEntry.id}`
        );
      }
    }
  }

  private async processEntry(
    cloudEntry: CloudDiaryEntry,

    resolutions: CloudDiaryDownloadResolutionMap
  ): Promise<DownloadEntryOutcome> {
    const localEntry = this.localEntriesById.get(cloudEntry.id);

    if (localEntry === undefined) {
      await this.repository.insertSynced(createSyncedEntryInput(cloudEntry));

      return 'added';
    }

    const resolution = resolutions.get(cloudEntry.id);

    if (resolution === 'skip') {
      return 'skipped';
    }

    if (resolution !== 'replace') {
      throw new Error(`Cloud diary conflict is unresolved: ${cloudEntry.id}`);
    }

    await this.repository.replaceSynced(createSyncedEntryInput(cloudEntry));

    cleanupReplacedLocalPhoto({
      userId: this.userId,

      localEntry,
    });

    return 'replaced';
  }

  public async complete(
    resolutions: CloudDiaryDownloadResolutionMap
  ): Promise<DownloadCloudEntriesResult> {
    this.assertActive();

    try {
      this.validateResolutions(resolutions);
    } catch (error) {
      this.closed = true;

      this.transfer.fail();

      throw error;
    }

    this.transfer.setPhase('processing');

    const result = createEmptyResult();

    try {
      for (const [index, cloudEntry] of this.entries.entries()) {
        let outcome: DownloadEntryOutcome;

        try {
          outcome = await this.processEntry(cloudEntry, resolutions);
        } catch (error) {
          console.error(
            `Failed to download cloud diary entry: ${cloudEntry.id}`,
            error
          );

          outcome = 'failed';
        }

        result[outcome] += 1;

        this.transfer.updateProgress({
          processedEntries: index + 1,
        });
      }

      if (result.added > 0 || result.replaced > 0) {
        await this.onCommitted();
      }

      this.closed = true;

      this.transfer.complete();

      return result;
    } catch (error) {
      this.closed = true;

      this.transfer.fail();

      throw error;
    }
  }

  public cancel(): void {
    if (this.closed) {
      return;
    }

    this.closed = true;

    this.transfer.cancel();
  }
}

export class CloudDiaryDownloadService {
  private readonly userId: string;

  private readonly repository: CloudDiaryDownloadRepository;

  private readonly onCommitted: () => void | Promise<void>;

  public constructor({
    userId,
    repository,
    onCommitted = () => undefined,
  }: CloudDiaryDownloadServiceParams) {
    this.userId = userId;

    this.repository = repository;

    this.onCommitted = onCommitted;
  }

  public async begin(
    sourceEntries: readonly CloudDiaryEntry[]
  ): Promise<CloudDiaryDownloadSession> {
    validateCloudEntries({
      userId: this.userId,

      entries: sourceEntries,
    });

    const entries = sourceEntries.map(cloneCloudEntry);

    const transfer = await beginDiaryTransfer({
      userId: this.userId,

      type: 'cloudDownload',

      totalEntries: entries.length,
    });

    try {
      transfer.setPhase('validating');

      const localEntries = await this.repository.findByIds(
        entries.map((entry) => entry.id)
      );

      const localEntriesById = new Map(
        localEntries.map((entry) => [entry.id, entry])
      );

      const conflicts: CloudDiaryDownloadConflict[] = [];

      for (const cloudEntry of entries) {
        const localEntry = localEntriesById.get(cloudEntry.id);

        if (localEntry === undefined) {
          continue;
        }

        conflicts.push({
          cloudEntry,
          localEntry,
        });
      }

      if (conflicts.length > 0) {
        transfer.setPhase('resolvingConflicts');
      }

      return new CloudDiaryDownloadSessionImpl(
        this.userId,
        this.repository,
        entries,
        localEntriesById,
        conflicts,
        transfer,
        this.onCommitted
      );
    } catch (error) {
      transfer.fail();

      throw error;
    }
  }
}
