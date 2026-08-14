import { act, renderHook } from '@testing-library/react-native';

import type { CloudDiaryEntry, DiaryEntry } from '@entities/diary';

import type {
  CloudDiaryDownloadConflict,
  CloudDiaryDownloadSession,
  DownloadCloudEntriesResult,
} from '../cloudDiaryDownload.types';
import { useCloudDiaryDownloadFlow } from '../useCloudDiaryDownloadFlow';

const mockBegin = jest.fn();

const mockComplete = jest.fn();

jest.mock('../../api/useDownloadCloudEntriesMutation', () => ({
  useDownloadCloudEntriesMutation: () => ({
    begin: mockBegin,

    complete: mockComplete,

    isChecking: false,

    isProcessing: false,

    error: null,
  }),
}));

const createCloudEntry = (id: string): CloudDiaryEntry => ({
  id,

  userId: 'user-1',

  glucose: 6,

  mealRelation: null,

  shortInsulin: null,

  longInsulin: null,

  carbsGram: null,

  comment: `Cloud ${id}`,

  aiAnalysis: '',

  photoPath: null,

  photoUrl: null,

  eventAt: new Date('2026-08-14T12:00:00.000Z'),
});

const createLocalEntry = (id: string): DiaryEntry => ({
  id,

  userId: 'user-1',

  glucose: 8,

  mealRelation: null,

  shortInsulin: null,

  longInsulin: null,

  carbsGram: null,

  comment: `Local ${id}`,

  aiAnalysis: '',

  localPhotoUri: null,

  photoPath: null,

  photoUrl: null,

  eventAt: new Date('2026-08-13T12:00:00.000Z'),

  syncStatus: 'synced',
});

const createConflict = (id: string): CloudDiaryDownloadConflict => ({
  cloudEntry: createCloudEntry(id),

  localEntry: createLocalEntry(id),
});

const createResult = (): DownloadCloudEntriesResult => ({
  added: 1,
  replaced: 0,
  skipped: 0,
  failed: 0,
});

const createSession = (
  conflicts: readonly CloudDiaryDownloadConflict[]
): CloudDiaryDownloadSession => ({
  conflicts,

  complete: jest.fn(),

  cancel: jest.fn(),
});

describe('useCloudDiaryDownloadFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finishes immediately when there are no conflicts', async () => {
    const cloud = createCloudEntry('entry-1');

    const downloadResult = createResult();

    mockBegin.mockResolvedValue({
      status: 'completed',

      result: downloadResult,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start([cloud]);
    });

    expect(hook.current.step).toBe('result');

    expect(hook.current.result).toEqual(downloadResult);
  });

  it('opens strategy selection when conflicts exist', async () => {
    const conflict = createConflict('entry-1');

    const session = createSession([conflict]);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts: session.conflicts,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start([conflict.cloudEntry]);
    });

    expect(hook.current.step).toBe('strategy');

    expect(hook.current.conflictsCount).toBe(1);

    expect(hook.current.conflicts).toEqual([conflict]);
  });

  it('applies skipAll to every conflict', async () => {
    const conflicts = [createConflict('entry-1'), createConflict('entry-2')];

    const session = createSession(conflicts);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts,
    });

    mockComplete.mockResolvedValue({
      added: 0,
      replaced: 0,
      skipped: 2,
      failed: 0,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start(
        conflicts.map((conflict) => conflict.cloudEntry)
      );
    });

    expect(hook.current.step).toBe('strategy');

    await act(async () => {
      await hook.current.chooseStrategy('skipAll');
    });

    expect(mockComplete).toHaveBeenCalledTimes(1);

    const input = mockComplete.mock.calls[0][0];

    expect(input.session).toBe(session);

    expect(input.resolutions.get('entry-1')).toBe('skip');

    expect(input.resolutions.get('entry-2')).toBe('skip');

    expect(hook.current.step).toBe('result');
  });

  it('collects all individual decisions before processing', async () => {
    const conflicts = [createConflict('entry-1'), createConflict('entry-2')];

    const session = createSession(conflicts);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts,
    });

    mockComplete.mockResolvedValue({
      added: 0,
      replaced: 1,
      skipped: 1,
      failed: 0,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start(
        conflicts.map((conflict) => conflict.cloudEntry)
      );
    });

    expect(hook.current.step).toBe('strategy');

    await act(async () => {
      await hook.current.chooseStrategy('review');
    });

    expect(hook.current.step).toBe('review');

    expect(hook.current.reviewNumber).toBe(1);

    await act(async () => {
      await hook.current.resolveCurrent('replace');
    });

    expect(mockComplete).not.toHaveBeenCalled();

    expect(hook.current.step).toBe('review');

    expect(hook.current.reviewNumber).toBe(2);

    await act(async () => {
      await hook.current.resolveCurrent('skip');
    });

    expect(mockComplete).toHaveBeenCalledTimes(1);

    const input = mockComplete.mock.calls[0][0];

    expect(input.resolutions.get('entry-1')).toBe('replace');

    expect(input.resolutions.get('entry-2')).toBe('skip');

    expect(hook.current.step).toBe('result');
  });

  it('applies one review decision to all remaining conflicts', async () => {
    const conflicts = [
      createConflict('entry-1'),

      createConflict('entry-2'),

      createConflict('entry-3'),
    ];

    const session = createSession(conflicts);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts,
    });

    mockComplete.mockResolvedValue({
      added: 0,
      replaced: 3,
      skipped: 0,
      failed: 0,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start(
        conflicts.map((conflict) => conflict.cloudEntry)
      );
    });

    expect(hook.current.step).toBe('strategy');

    await act(async () => {
      await hook.current.chooseStrategy('review');
    });

    expect(hook.current.step).toBe('review');

    await act(async () => {
      await hook.current.resolveCurrent('replace', true);
    });

    expect(mockComplete).toHaveBeenCalledTimes(1);

    const input = mockComplete.mock.calls[0][0];

    expect(input.resolutions.get('entry-1')).toBe('replace');

    expect(input.resolutions.get('entry-2')).toBe('replace');

    expect(input.resolutions.get('entry-3')).toBe('replace');

    expect(hook.current.step).toBe('result');
  });

  it('cancels the active session without processing conflicts', async () => {
    const conflict = createConflict('entry-1');

    const session = createSession([conflict]);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts: session.conflicts,
    });

    const { result: hook } = renderHook(() => useCloudDiaryDownloadFlow());

    await act(async () => {
      await hook.current.start([conflict.cloudEntry]);
    });

    expect(hook.current.step).toBe('strategy');

    act(() => {
      hook.current.cancel();
    });

    expect(session.cancel).toHaveBeenCalledTimes(1);

    expect(mockComplete).not.toHaveBeenCalled();

    expect(hook.current.step).toBe('idle');
  });

  it('cancels an unresolved session when the consumer unmounts', async () => {
    const conflict = createConflict('entry-1');

    const session = createSession([conflict]);

    mockBegin.mockResolvedValue({
      status: 'conflicts',

      session,

      conflicts: session.conflicts,
    });

    const { result: hook, unmount } = renderHook(() =>
      useCloudDiaryDownloadFlow()
    );

    await act(async () => {
      await hook.current.start([conflict.cloudEntry]);
    });

    expect(hook.current.step).toBe('strategy');

    unmount();

    expect(session.cancel).toHaveBeenCalledTimes(1);
  });
});
