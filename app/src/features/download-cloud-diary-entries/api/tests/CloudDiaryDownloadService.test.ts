import type {
  CloudDiaryEntry,
  DiaryEntry,
  DiaryLocalRepository,
} from '@entities/diary';

import { CloudDiaryDownloadService } from '../CloudDiaryDownloadService';

const mockSetPhase = jest.fn();

const mockUpdateProgress = jest.fn();

const mockTransferComplete = jest.fn();

const mockTransferFail = jest.fn();

const mockTransferCancel = jest.fn();

const mockBeginDiaryTransfer = jest.fn();

const mockPhotoFinalize = jest.fn();

const mockPhotoRollback = jest.fn();

const mockPrepareDiaryPhotoRemoval = jest.fn();

jest.mock('@entities/diary', () => ({
  CLOUD_DIARY_PAGE_SIZE: 30,

  beginDiaryTransfer: (input: unknown) => mockBeginDiaryTransfer(input),

  prepareDiaryPhotoRemoval: (input: unknown) =>
    mockPrepareDiaryPhotoRemoval(input),
}));

type DownloadRepository = Pick<
  DiaryLocalRepository,
  'findByIds' | 'insertSynced' | 'replaceSynced'
>;

const mockFindByIds = jest.fn<
  ReturnType<DownloadRepository['findByIds']>,
  Parameters<DownloadRepository['findByIds']>
>();

const mockInsertSynced = jest.fn<
  ReturnType<DownloadRepository['insertSynced']>,
  Parameters<DownloadRepository['insertSynced']>
>();

const mockReplaceSynced = jest.fn<
  ReturnType<DownloadRepository['replaceSynced']>,
  Parameters<DownloadRepository['replaceSynced']>
>();

const repository: DownloadRepository = {
  findByIds: mockFindByIds,
  insertSynced: mockInsertSynced,
  replaceSynced: mockReplaceSynced,
};

const createCloudEntry = (id: string): CloudDiaryEntry => ({
  id,

  userId: 'user-1',

  glucose: 6.4,
  mealRelation: null,
  shortInsulin: 2,
  ultraShortInsulin: 1.5,
  longInsulin: null,
  carbsGram: 45,

  comment: `Cloud ${id}`,
  aiAnalysis: `AI ${id}`,

  photoPath: `users/user-1/diaryPhotos/${id}.jpg`,
  photoUrl: `https://example.com/${id}.jpg`,

  eventAt: new Date('2026-08-14T12:00:00.000Z'),
});

const createLocalEntry = (
  id: string,
  syncStatus: DiaryEntry['syncStatus'] = 'synced'
): DiaryEntry => ({
  id,

  userId: 'user-1',

  glucose: 10,
  mealRelation: null,
  shortInsulin: null,
  ultraShortInsulin: null,
  longInsulin: 5,
  carbsGram: 15,

  comment: `Local ${id}`,
  aiAnalysis: '',

  localPhotoUri: `file:///local/${id}.jpg`,
  photoPath: `users/user-1/diaryPhotos/${id}.jpg`,
  photoUrl: null,

  eventAt: new Date('2026-08-13T12:00:00.000Z'),

  syncStatus,
});

const createTransfer = () => ({
  setPhase: mockSetPhase,

  updateProgress: mockUpdateProgress,

  complete: mockTransferComplete,

  fail: mockTransferFail,

  cancel: mockTransferCancel,
});

describe('CloudDiaryDownloadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBeginDiaryTransfer.mockResolvedValue(createTransfer());

    mockPrepareDiaryPhotoRemoval.mockReturnValue({
      finalize: mockPhotoFinalize,

      rollback: mockPhotoRollback,
    });

    mockFindByIds.mockResolvedValue([]);

    mockInsertSynced.mockResolvedValue();

    mockReplaceSynced.mockResolvedValue();
  });

  it('detects conflicts without changing SQLite', async () => {
    const cloud = createCloudEntry('entry-1');

    const local = createLocalEntry('entry-1');

    mockFindByIds.mockResolvedValue([local]);

    const service = new CloudDiaryDownloadService({
      userId: 'user-1',

      repository,
    });

    const session = await service.begin([cloud]);

    expect(mockBeginDiaryTransfer).toHaveBeenCalledWith({
      userId: 'user-1',

      type: 'cloudDownload',

      totalEntries: 1,
    });

    expect(mockFindByIds).toHaveBeenCalledWith(['entry-1']);

    expect(session.conflicts).toEqual([
      {
        cloudEntry: cloud,

        localEntry: local,
      },
    ]);

    expect(mockSetPhase).toHaveBeenCalledWith('validating');

    expect(mockSetPhase).toHaveBeenCalledWith('resolvingConflicts');

    expect(mockInsertSynced).not.toHaveBeenCalled();

    expect(mockReplaceSynced).not.toHaveBeenCalled();
  });

  it('adds a missing entry as synced without downloading its photo', async () => {
    const cloud = createCloudEntry('entry-1');

    const onCommitted = jest.fn<Promise<void>, []>(async () => undefined);

    const service = new CloudDiaryDownloadService({
      userId: 'user-1',

      repository,

      onCommitted,
    });

    const session = await service.begin([cloud]);

    const result = await session.complete(new Map());

    expect(mockInsertSynced).toHaveBeenCalledWith({
      id: cloud.id,

      glucose: cloud.glucose,

      mealRelation: cloud.mealRelation,

      shortInsulin: cloud.shortInsulin,

      ultraShortInsulin: cloud.ultraShortInsulin,

      longInsulin: cloud.longInsulin,

      carbsGram: cloud.carbsGram,

      comment: cloud.comment,

      aiAnalysis: cloud.aiAnalysis,

      localPhotoUri: null,

      photoPath: cloud.photoPath,

      photoUrl: cloud.photoUrl,

      eventAt: cloud.eventAt,
    });

    expect(result).toEqual({
      added: 1,
      replaced: 0,
      skipped: 0,
      failed: 0,
    });

    expect(onCommitted).toHaveBeenCalledTimes(1);

    expect(mockTransferComplete).toHaveBeenCalledTimes(1);
  });

  it('replaces a pendingDelete conflict and removes the old local photo after the write', async () => {
    const cloud = createCloudEntry('entry-1');

    const local = createLocalEntry('entry-1', 'pendingDelete');

    mockFindByIds.mockResolvedValue([local]);

    const onCommitted = jest.fn<Promise<void>, []>(async () => undefined);

    const service = new CloudDiaryDownloadService({
      userId: 'user-1',

      repository,

      onCommitted,
    });

    const session = await service.begin([cloud]);

    const result = await session.complete(new Map([[cloud.id, 'replace']]));

    expect(mockReplaceSynced).toHaveBeenCalledTimes(1);

    expect(mockPrepareDiaryPhotoRemoval).toHaveBeenCalledWith({
      userId: 'user-1',

      entryId: 'entry-1',
    });

    expect(mockPhotoFinalize).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      added: 0,
      replaced: 1,
      skipped: 0,
      failed: 0,
    });

    const replaceOrder = mockReplaceSynced.mock.invocationCallOrder[0];

    const photoOrder = mockPhotoFinalize.mock.invocationCallOrder[0];

    const invalidateOrder = onCommitted.mock.invocationCallOrder[0];

    const completeOrder = mockTransferComplete.mock.invocationCallOrder[0];

    expect(replaceOrder).toBeLessThan(photoOrder);

    expect(photoOrder).toBeLessThan(invalidateOrder);

    expect(invalidateOrder).toBeLessThan(completeOrder);
  });

  it('skips a conflict without writing it', async () => {
    const cloud = createCloudEntry('entry-1');

    const local = createLocalEntry('entry-1');

    mockFindByIds.mockResolvedValue([local]);

    const onCommitted = jest.fn();

    const service = new CloudDiaryDownloadService({
      userId: 'user-1',

      repository,

      onCommitted,
    });

    const session = await service.begin([cloud]);

    const result = await session.complete(new Map([[cloud.id, 'skip']]));

    expect(mockInsertSynced).not.toHaveBeenCalled();

    expect(mockReplaceSynced).not.toHaveBeenCalled();

    expect(mockPrepareDiaryPhotoRemoval).not.toHaveBeenCalled();

    expect(onCommitted).not.toHaveBeenCalled();

    expect(result).toEqual({
      added: 0,
      replaced: 0,
      skipped: 1,
      failed: 0,
    });

    expect(mockTransferComplete).toHaveBeenCalledTimes(1);
  });

  it('continues processing after one entry fails', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      const first = createCloudEntry('entry-1');

      const second = createCloudEntry('entry-2');

      mockInsertSynced
        .mockRejectedValueOnce(new Error('SQLite failure'))
        .mockResolvedValueOnce();

      const onCommitted = jest.fn();

      const service = new CloudDiaryDownloadService({
        userId: 'user-1',

        repository,

        onCommitted,
      });

      const session = await service.begin([first, second]);

      const result = await session.complete(new Map());

      expect(mockInsertSynced).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        added: 1,
        replaced: 0,
        skipped: 0,
        failed: 1,
      });

      expect(mockUpdateProgress).toHaveBeenLastCalledWith({
        processedEntries: 2,
      });

      expect(onCommitted).toHaveBeenCalledTimes(1);

      expect(mockTransferComplete).toHaveBeenCalledTimes(1);

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to download cloud diary entry: entry-1',
        expect.any(Error)
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('cancels without changing SQLite', async () => {
    const cloud = createCloudEntry('entry-1');

    const local = createLocalEntry('entry-1');

    mockFindByIds.mockResolvedValue([local]);

    const service = new CloudDiaryDownloadService({
      userId: 'user-1',

      repository,
    });

    const session = await service.begin([cloud]);

    session.cancel();

    expect(mockTransferCancel).toHaveBeenCalledTimes(1);

    expect(mockInsertSynced).not.toHaveBeenCalled();

    expect(mockReplaceSynced).not.toHaveBeenCalled();
  });
});
