import { useCallback, useEffect } from 'react';

import type {
  DiaryExportFormat,
  DiaryExportScope,
} from '@features/export-diary';
import {
  type DiaryImportConflictDecision,
  type DiaryImportSource,
  useDiaryImportSession,
} from '@features/import-diary';
import { useDiaryTransferState } from '@entities/diary';

import { useDiaryTransferExport } from './useDiaryTransferExport';
import { useDiaryTransferNavigation } from './useDiaryTransferNavigation';

type StartDiaryTransferExportInput = {
  format: DiaryExportFormat;
  scope: DiaryExportScope;
};

type UseDiaryTransferControllerParams = {
  visible: boolean;
  onClose: () => void;
};

export const useDiaryTransferController = ({
  visible,
  onClose,
}: UseDiaryTransferControllerParams) => {
  const transferState = useDiaryTransferState();

  const exportFlow = useDiaryTransferExport();

  const importFlow = useDiaryImportSession();

  const navigation = useDiaryTransferNavigation({
    visible,

    transferPhase: transferState.phase,

    operationPending:
      exportFlow.isExporting ||
      importFlow.isPicking ||
      importFlow.isPreparing ||
      importFlow.isImporting,

    onClose,
  });

  useEffect(() => {
    if (visible) {
      return;
    }

    exportFlow.resetExport();
    importFlow.cancelSession();
  }, [exportFlow.resetExport, importFlow.cancelSession, visible]);

  useEffect(() => {
    if (
      navigation.currentRoute.name !== 'import.progress' ||
      importFlow.isImporting ||
      importFlow.result !== null ||
      importFlow.error !== null ||
      importFlow.conflicts.plan === null ||
      !importFlow.hasActiveSession
    ) {
      return;
    }

    void importFlow.executeImport();
  }, [
    importFlow.conflicts.plan,
    importFlow.error,
    importFlow.executeImport,
    importFlow.hasActiveSession,
    importFlow.isImporting,
    importFlow.result,
    navigation.currentRoute.name,
  ]);

  const startExport = useCallback(
    async ({ format, scope }: StartDiaryTransferExportInput): Promise<void> => {
      if (!exportFlow.canExport) {
        return;
      }

      navigation.pushRoute({
        name: 'export.progress',
        format,
      });

      try {
        await exportFlow.startExport({
          format,
          scope,
        });
      } catch {
        return;
      }
    },
    [exportFlow.canExport, exportFlow.startExport, navigation.pushRoute]
  );

  const openImportPreview = useCallback(
    (source: DiaryImportSource): void => {
      if (
        importFlow.isPicking ||
        importFlow.isPreparing ||
        importFlow.isImporting ||
        importFlow.hasActiveSession
      ) {
        return;
      }

      importFlow.clearError();

      navigation.pushRoute({
        name: 'import.preview',
        source,
      });
    },
    [
      importFlow.clearError,
      importFlow.hasActiveSession,
      importFlow.isImporting,
      importFlow.isPicking,
      importFlow.isPreparing,
      navigation.pushRoute,
    ]
  );

  const chooseImportFromDevice = useCallback(async (): Promise<void> => {
    const source = await importFlow.chooseFromDevice();

    if (source === null) {
      return;
    }

    openImportPreview(source);
  }, [importFlow.chooseFromDevice, openImportPreview]);

  const prepareImportPreview = useCallback(
    (source: DiaryImportSource) => importFlow.prepareSource(source),
    [importFlow.prepareSource]
  );

  const continueImportFromPreview = useCallback((): void => {
    if (importFlow.preview === null || !importFlow.hasActiveSession) {
      return;
    }

    if (importFlow.preview.matchesCount > 0) {
      importFlow.conflicts.reset();

      navigation.pushTransferRoute({
        name: 'import.conflicts',
      });

      return;
    }

    navigation.pushTransferRoute({
      name: 'import.progress',
    });
  }, [
    importFlow.conflicts.reset,
    importFlow.hasActiveSession,
    importFlow.preview,
    navigation.pushTransferRoute,
  ]);

  const resolveAllImportConflicts = useCallback(
    (decision: DiaryImportConflictDecision): void => {
      if (
        importFlow.preview === null ||
        importFlow.preview.matchesCount === 0 ||
        !importFlow.hasActiveSession
      ) {
        return;
      }

      importFlow.conflicts.resolveAll(decision);

      navigation.pushTransferRoute({
        name: 'import.progress',
      });
    },
    [
      importFlow.conflicts.resolveAll,
      importFlow.hasActiveSession,
      importFlow.preview,
      navigation.pushTransferRoute,
    ]
  );

  const openIndividualImportReview = useCallback((): void => {
    if (importFlow.conflictItems.length === 0 || !importFlow.hasActiveSession) {
      return;
    }

    importFlow.conflicts.startIndividualReview();

    navigation.pushTransferRoute({
      name: 'import.review',
    });
  }, [
    importFlow.conflictItems.length,
    importFlow.conflicts.startIndividualReview,
    importFlow.hasActiveSession,
    navigation.pushTransferRoute,
  ]);

  const backFromIndividualImportReview = useCallback((): void => {
    navigation.popTransferRoute();
  }, [navigation.popTransferRoute]);

  const continueIndividualImport = useCallback((): void => {
    if (
      importFlow.conflicts.plan === null ||
      importFlow.conflicts.plan.type !== 'individual' ||
      importFlow.conflicts.resolvedCount !== importFlow.conflictItems.length ||
      !importFlow.hasActiveSession
    ) {
      return;
    }

    navigation.pushTransferRoute({
      name: 'import.progress',
    });
  }, [
    importFlow.conflictItems.length,
    importFlow.conflicts.plan,
    importFlow.conflicts.resolvedCount,
    importFlow.hasActiveSession,
    navigation.pushTransferRoute,
  ]);

  const backFromImportConflicts = useCallback((): void => {
    importFlow.conflicts.reset();

    navigation.popTransferRoute();
  }, [importFlow.conflicts.reset, navigation.popTransferRoute]);

  const cancelImportAndPop = useCallback((): void => {
    importFlow.cancelSession();

    navigation.popTransferRoute();
  }, [importFlow.cancelSession, navigation.popTransferRoute]);

  return {
    transferState,

    exportFlow,
    importFlow,

    navigation,

    startExport,

    openImportPreview,
    chooseImportFromDevice,
    prepareImportPreview,

    continueImportFromPreview,
    resolveAllImportConflicts,

    openIndividualImportReview,
    backFromIndividualImportReview,
    continueIndividualImport,

    backFromImportConflicts,

    cancelImportAndPop,
  };
};

export type DiaryTransferController = ReturnType<
  typeof useDiaryTransferController
>;
