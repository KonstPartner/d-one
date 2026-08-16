import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { DiaryEntry } from '@entities/diary';

import { useDiaryTransferController } from '../useDiaryTransferController';

type ConflictDecision = 'skip' | 'replace';

type ConflictPlan =
  | {
      type: 'none';
    }
  | {
      type: 'all';
      decision: ConflictDecision;
    }
  | {
      type: 'individual';
      decisions: ReadonlyMap<string, ConflictDecision>;
    }
  | null;

type MockImportFlow = {
  preview: {
    fileName: string;
    exportType: 'lightweightBackup';
    exportedAt: string;
    sourceUserName: string;
    sourceUserId: string;
    recordsScope: {
      type: 'all';
    };
    entriesCount: number;
    photosCount: number;
    matchesCount: number;
  } | null;

  result: {
    totalEntries: number;
    processedEntries: number;
    addedEntries: number;
    replacedEntries: number;
    skippedEntries: number;
  } | null;

  conflictItems: ReadonlyArray<{
    entryId: string;
    localEntry: DiaryEntry;
    backupEntry: {
      id: string;
      glucose: number | null;
      mealRelation: null;
      shortInsulin: number | null;
      ultraShortInsulin: number | null;
      longInsulin: number | null;
      carbsGram: number | null;
      comment: string;
      aiAnalysis: string;
      photoFileName: null;
      photoUrl: null;
      eventAt: string;
    };
    backupPhotoUri: null;
  }>;

  conflictEntryIds: readonly string[];

  conflicts: {
    mode: 'unresolved' | 'all' | 'individual';
    resolvedCount: number;
    totalCount: number;
    plan: ConflictPlan;

    resolveAll: jest.Mock;
    startIndividualReview: jest.Mock;
    setIndividualDecision: jest.Mock;
    clearIndividualDecision: jest.Mock;
    getDecision: jest.Mock;
    reset: jest.Mock;
  };

  isPicking: boolean;
  isPreparing: boolean;
  isImporting: boolean;
  hasActiveSession: boolean;

  chooseFromDevice: jest.Mock;
  prepareSource: jest.Mock;
  executeImport: jest.Mock;
  cancelSession: jest.Mock;
};

type MockExportFlow = {
  canExport: boolean;
  isExporting: boolean;
  result: null;

  startExport: jest.Mock;
  resetExport: jest.Mock;
};

let mockImportFlow: MockImportFlow;
let mockExportFlow: MockExportFlow;

let mockTransferState = {
  type: null as null | 'import' | 'export' | 'cloudDownload',
  phase: 'idle' as
    | 'idle'
    | 'waitingForSync'
    | 'validating'
    | 'resolvingConflicts'
    | 'processing'
    | 'completed'
    | 'failed',

  processedEntries: 0,
  totalEntries: 0,

  processedPhotos: 0,
  totalPhotos: 0,
};

jest.mock('@features/import-diary', () => {
  const { getDiaryImportPlanSummary } = jest.requireActual(
    '@features/import-diary/model/diaryImportPlanSummary'
  );

  return {
    getDiaryImportPlanSummary,

    useDiaryImportSession: () => mockImportFlow,
  };
});

jest.mock('../useDiaryTransferExport', () => ({
  useDiaryTransferExport: () => mockExportFlow,
}));

jest.mock('@entities/diary', () => ({
  useDiaryTransferState: () => mockTransferState,

  isDiaryTransferLocked: () =>
    mockTransferState.phase === 'waitingForSync' ||
    mockTransferState.phase === 'validating' ||
    mockTransferState.phase === 'resolvingConflicts' ||
    mockTransferState.phase === 'processing',
}));

const createLocalEntry = (): DiaryEntry => ({
  id: 'entry-conflict',
  userId: 'current-user',

  glucose: 8.2,
  mealRelation: null,

  shortInsulin: null,
  ultraShortInsulin: null,
  longInsulin: null,
  carbsGram: null,

  comment: 'local',
  aiAnalysis: '',

  localPhotoUri: null,
  photoPath: null,
  photoUrl: null,

  eventAt: new Date('2026-08-14T10:00:00.000Z'),

  syncStatus: 'synced',
});

const createImportFlow = (): MockImportFlow => {
  const flow: MockImportFlow = {
    preview: null,
    result: null,

    conflictItems: [],
    conflictEntryIds: [],

    conflicts: {
      mode: 'unresolved',

      resolvedCount: 0,
      totalCount: 0,

      plan: null,

      resolveAll: jest.fn(),
      startIndividualReview: jest.fn(),
      setIndividualDecision: jest.fn(),
      clearIndividualDecision: jest.fn(),
      getDecision: jest.fn(() => null),
      reset: jest.fn(),
    },

    isPicking: false,
    isPreparing: false,
    isImporting: false,

    hasActiveSession: false,

    chooseFromDevice: jest.fn(),
    prepareSource: jest.fn(),
    executeImport: jest.fn(),
    cancelSession: jest.fn(),
  };

  flow.conflicts.resolveAll.mockImplementation((decision: ConflictDecision) => {
    flow.conflicts.mode = 'all';

    flow.conflicts.resolvedCount = flow.conflictEntryIds.length;

    flow.conflicts.plan = {
      type: 'all',
      decision,
    };
  });

  flow.conflicts.startIndividualReview.mockImplementation(() => {
    flow.conflicts.mode = 'individual';
    flow.conflicts.plan = null;
  });

  return flow;
};

const createExportFlow = (): MockExportFlow => ({
  canExport: true,
  isExporting: false,

  result: null,

  startExport: jest.fn(),
  resetExport: jest.fn(),
});

describe('useDiaryTransferController integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockImportFlow = createImportFlow();
    mockExportFlow = createExportFlow();

    mockTransferState = {
      type: null,
      phase: 'idle',

      processedEntries: 0,
      totalEntries: 0,

      processedPhotos: 0,
      totalPhotos: 0,
    };
  });

  it('moves an import with conflicts through preview, confirmation and execution', async () => {
    const onClose = jest.fn();

    mockImportFlow.executeImport.mockResolvedValue('completed');

    const { result, rerender } = renderHook(() =>
      useDiaryTransferController({
        visible: true,
        onClose,
      })
    );

    expect(result.current.navigation.currentRoute).toEqual({
      name: 'home',
    });

    act(() => {
      result.current.openImportPreview({
        fileName: 'backup.zip',
        fileUri: 'file:///backup.zip',
      });
    });

    expect(result.current.navigation.currentRoute).toEqual({
      name: 'import.preview',

      source: {
        fileName: 'backup.zip',
        fileUri: 'file:///backup.zip',
      },
    });

    const localEntry = createLocalEntry();

    mockImportFlow.preview = {
      fileName: 'backup.zip',

      exportType: 'lightweightBackup',

      exportedAt: '2026-08-15T12:00:00.000Z',

      sourceUserName: 'Backup User',
      sourceUserId: 'backup-user',

      recordsScope: {
        type: 'all',
      },

      entriesCount: 2,
      photosCount: 0,
      matchesCount: 1,
    };

    mockImportFlow.conflictItems = [
      {
        entryId: 'entry-conflict',

        localEntry,

        backupEntry: {
          id: 'entry-conflict',

          glucose: 6.2,
          mealRelation: null,

          shortInsulin: null,
          ultraShortInsulin: null,
          longInsulin: null,
          carbsGram: null,

          comment: 'backup',
          aiAnalysis: '',

          photoFileName: null,
          photoUrl: null,

          eventAt: '2026-08-15T10:00:00.000Z',
        },

        backupPhotoUri: null,
      },
    ];

    mockImportFlow.conflictEntryIds = ['entry-conflict'];
    mockImportFlow.conflicts.totalCount = 1;
    mockImportFlow.hasActiveSession = true;

    mockTransferState = {
      ...mockTransferState,

      type: 'import',
      phase: 'resolvingConflicts',

      totalEntries: 2,
    };

    rerender(undefined);

    expect(result.current.selectedImportConflictStrategy).toBeNull();
    expect(result.current.importConfirmationSummary).toBeNull();

    act(() => {
      result.current.selectImportConflictStrategy('replace');
    });

    rerender(undefined);

    expect(result.current.selectedImportConflictStrategy).toBe('replace');

    expect(result.current.importConfirmationSummary).toEqual({
      entriesCount: 2,

      newEntries: 1,
      replacedEntries: 1,
      skippedEntries: 0,

      photosCount: 0,
    });

    act(() => {
      result.current.continueImportFromPreview();
    });

    expect(result.current.navigation.currentRoute).toEqual({
      name: 'import.confirmation',
    });

    act(() => {
      result.current.startConfirmedImport();
    });

    expect(result.current.navigation.currentRoute).toEqual({
      name: 'import.progress',
    });

    await waitFor(() => {
      expect(mockImportFlow.executeImport).toHaveBeenCalledTimes(1);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('returns from export progress when export creation fails', async () => {
    const onClose = jest.fn();

    mockExportFlow.startExport.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useDiaryTransferController({
        visible: true,
        onClose,
      })
    );

    await act(async () => {
      await result.current.startExport({
        format: 'csv',

        scope: {
          type: 'all',
        },
      });
    });

    expect(mockExportFlow.startExport).toHaveBeenCalledWith({
      format: 'csv',

      scope: {
        type: 'all',
      },
    });

    expect(result.current.navigation.currentRoute).toEqual({
      name: 'home',
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
