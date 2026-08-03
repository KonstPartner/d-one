import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { collection, doc } from 'firebase/firestore';
import type { PropsWithChildren } from 'react';

import { useDiaryListStore } from '../../../model/store';
import type {
  CreateDiaryEntryData,
  DiaryEntry,
  UpdateDiaryEntryData,
} from '../../../model/types';
import {
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
} from '../../diaryPhotoService';
import { useReadyDiaryDatabase } from '../../sqlite/DiaryDatabaseProvider';
import type { DiaryRepository } from '../../sqlite/diaryRepository';
import useCreateDiaryEntry from '../useCreateDiaryEntry';
import useUpdateDiaryEntry from '../useUpdateDiaryEntry';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/config', () => ({
  db: {},
}));

jest.mock('../../diaryPhotoService', () => ({
  prepareDiaryPhotoForEntry: jest.fn(),
  prepareDiaryPhotoRemoval: jest.fn(),
}));

jest.mock('../../sqlite/DiaryDatabaseProvider', () => ({
  useReadyDiaryDatabase: jest.fn(),
}));

const mockedCollection = jest.mocked(collection);
const mockedDoc = jest.mocked(doc);
const mockedPrepareDiaryPhotoForEntry = jest.mocked(prepareDiaryPhotoForEntry);
const mockedPrepareDiaryPhotoRemoval = jest.mocked(prepareDiaryPhotoRemoval);
const mockedUseReadyDiaryDatabase = jest.mocked(useReadyDiaryDatabase);

const createData: CreateDiaryEntryData = {
  glucose: 6.4,
  mealRelation: 'beforeMeal',
  shortInsulin: 3,
  longInsulin: null,
  carbsGram: 35,
  comment: 'Dinner',
  eventAt: new Date('2026-08-03T18:30:00.000Z'),
};

const updateData: UpdateDiaryEntryData = {
  ...createData,
  id: 'entry-1',
  comment: 'Updated dinner',
};

const currentEntry: DiaryEntry = {
  ...updateData,
  userId: 'user-1',
  aiAnalysis: '',
  localPhotoUri: 'file:///users/user-1/diaryPhotos/entry-1.jpg',
  photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
  photoUrl: 'https://example.com/entry-1.jpg',
  syncStatus: 'synced',
};

const repository = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const createPhotoFinalize = jest.fn();
const createPhotoRollback = jest.fn();
const removePhotoFinalize = jest.fn();
const removePhotoRollback = jest.fn();

let queryClient: QueryClient;

const TestProviders = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('diary entry photo mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
          gcTime: Infinity,
        },
      },
    });

    mockedCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockedDoc.mockReturnValue({
      id: 'entry-created',
    } as ReturnType<typeof doc>);

    mockedUseReadyDiaryDatabase.mockReturnValue({
      userId: 'user-1',
      repository: repository as unknown as DiaryRepository,
    });

    mockedPrepareDiaryPhotoForEntry.mockReturnValue({
      localPhotoUri: 'file:///users/user-1/diaryPhotos/entry-created.jpg',
      photoPath: 'users/user-1/diaryPhotos/entry-created.jpg',
      finalize: createPhotoFinalize,
      rollback: createPhotoRollback,
    });

    mockedPrepareDiaryPhotoRemoval.mockReturnValue({
      finalize: removePhotoFinalize,
      rollback: removePhotoRollback,
    });

    repository.create.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(currentEntry);
    repository.update.mockResolvedValue(undefined);

    useDiaryListStore.setState({
      currentPage: 4,
      collapsedDayKeys: new Set(['2026-08-02']),
    });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  it('creates an entry without a photo through the restored create hook', async () => {
    const { result } = renderHook(() => useCreateDiaryEntry(), {
      wrapper: TestProviders,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(createData)).resolves.toBe(
        'entry-created'
      );
    });

    expect(repository.create).toHaveBeenCalledWith({
      ...createData,
      id: 'entry-created',
      localPhotoUri: null,
      photoPath: null,
    });
    expect(mockedPrepareDiaryPhotoForEntry).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(useDiaryListStore.getState().currentPage).toBe(1);
    });
  });

  it('rolls back a prepared photo when entry creation fails', async () => {
    const error = new Error('SQLite insert failed');

    repository.create.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateDiaryEntry(), {
      wrapper: TestProviders,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...createData,
          photoDraftUri: 'file:///draft.jpg',
        })
      ).rejects.toBe(error);
    });

    expect(mockedPrepareDiaryPhotoForEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'entry-created',
      draftUri: 'file:///draft.jpg',
    });
    expect(createPhotoFinalize).not.toHaveBeenCalled();
    expect(createPhotoRollback).toHaveBeenCalledTimes(1);
  });

  it('deletes the local photo only together with a successful SQLite update', async () => {
    const { result } = renderHook(() => useUpdateDiaryEntry(), {
      wrapper: TestProviders,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...updateData,
          photoChange: {
            type: 'delete',
          },
        })
      ).resolves.toBe('entry-1');
    });

    expect(mockedPrepareDiaryPhotoRemoval).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'entry-1',
    });
    expect(repository.update).toHaveBeenCalledWith({
      ...updateData,
      photo: {
        localPhotoUri: null,
        photoPath: currentEntry.photoPath,
        photoUrl: null,
      },
    });
    expect(removePhotoFinalize).toHaveBeenCalledTimes(1);
    expect(removePhotoRollback).not.toHaveBeenCalled();
  });

  it('restores the local photo when its SQLite update fails', async () => {
    const error = new Error('SQLite update failed');

    repository.update.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUpdateDiaryEntry(), {
      wrapper: TestProviders,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...updateData,
          photoChange: {
            type: 'delete',
          },
        })
      ).rejects.toBe(error);
    });

    expect(removePhotoFinalize).not.toHaveBeenCalled();
    expect(removePhotoRollback).toHaveBeenCalledTimes(1);
  });
});
