import { useCallback, useEffect, useMemo } from 'react';

import type {
  DiaryExportFormat,
  DiaryExportScope,
} from '@features/export-diary';
import {
  type DiaryImportSource,
  getDiaryImportPlanSummary,
  useDiaryImportSession,
} from '@features/import-diary';
import { isDiaryTransferLocked, useDiaryTransferState } from '@entities/diary';

import type {
  ImportConfirmationSummary,
  ImportConflictStrategySelection,
} from './diaryImportFlow.types';
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
    if (visible || isDiaryTransferLocked()) {
      return;
    }

    exportFlow.resetExport();
    importFlow.cancelSession();
  }, [
    exportFlow.resetExport,
    importFlow.cancelSession,
    transferState.phase,
    visible,
  ]);

  useEffect(() => {
    if (
      navigation.currentRoute.name !== 'import.progress' ||
      importFlow.isImporting ||
      importFlow.result !== null ||
      importFlow.conflicts.plan === null ||
      !importFlow.hasActiveSession
    ) {
      return;
    }

    void importFlow.executeImport().then((status) => {
      if (status === 'failed') {
        onClose();
      }
    });
  }, [
    importFlow.conflicts.plan,
    importFlow.executeImport,
    importFlow.hasActiveSession,
    importFlow.isImporting,
    importFlow.result,
    navigation.currentRoute.name,
    onClose,
  ]);

  const selectedImportConflictStrategy =
    useMemo<ImportConflictStrategySelection | null>(() => {
      if (
        importFlow.preview === null ||
        importFlow.preview.matchesCount === 0
      ) {
        return null;
      }

      if (importFlow.conflicts.mode === 'individual') {
        return 'review';
      }

      return importFlow.conflicts.plan?.type === 'all'
        ? importFlow.conflicts.plan.decision
        : null;
    }, [
      importFlow.conflicts.mode,
      importFlow.conflicts.plan,
      importFlow.preview,
    ]);

  const importConfirmationSummary =
    useMemo<ImportConfirmationSummary | null>(() => {
      const preview = importFlow.preview;

      const plan = importFlow.conflicts.plan;

      if (preview === null || plan === null) {
        return null;
      }

      return getDiaryImportPlanSummary({
        preview,

        conflictItems: importFlow.conflictItems,

        plan,
      });
    }, [
      importFlow.conflictItems,
      importFlow.conflicts.plan,
      importFlow.preview,
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

      const exportResult = await exportFlow.startExport({
        format,
        scope,
      });

      if (exportResult === null) {
        navigation.popTransferRoute();
      }
    },
    [
      exportFlow.canExport,
      exportFlow.startExport,
      navigation.popTransferRoute,
      navigation.pushRoute,
    ]
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

      navigation.pushRoute({
        name: 'import.preview',
        source,
      });
    },
    [
      importFlow.hasActiveSession,
      importFlow.isImporting,
      importFlow.isPicking,
      importFlow.isPreparing,
      navigation.pushRoute,
    ]
  );

  const chooseImportFromDevice = useCallback(async (): Promise<void> => {
    const source = await importFlow.chooseFromDevice();

    if (source !== null) {
      openImportPreview(source);
    }
  }, [importFlow.chooseFromDevice, openImportPreview]);

  const prepareImportPreview = useCallback(
    (source: DiaryImportSource) => importFlow.prepareSource(source),
    [importFlow.prepareSource]
  );

  const selectImportConflictStrategy = useCallback(
    (strategy: ImportConflictStrategySelection): void => {
      if (strategy === 'skip' || strategy === 'replace') {
        importFlow.conflicts.resolveAll(strategy);

        return;
      }

      importFlow.conflicts.startIndividualReview();
    },
    [
      importFlow.conflicts.resolveAll,
      importFlow.conflicts.startIndividualReview,
    ]
  );

  const continueImportFromPreview = useCallback((): void => {
    if (importFlow.preview === null || !importFlow.hasActiveSession) {
      return;
    }

    if (importFlow.conflicts.mode === 'individual') {
      if (importFlow.conflicts.plan?.type === 'individual') {
        navigation.pushTransferRoute({
          name: 'import.confirmation',
        });
      } else {
        navigation.pushTransferRoute({
          name: 'import.review',
        });
      }

      return;
    }

    if (importFlow.conflicts.plan !== null) {
      navigation.pushTransferRoute({
        name: 'import.confirmation',
      });
    }
  }, [
    importFlow.conflicts.mode,
    importFlow.conflicts.plan,
    importFlow.hasActiveSession,
    importFlow.preview,
    navigation.pushTransferRoute,
  ]);

  const backFromIndividualImportReview = useCallback((): void => {
    navigation.popTransferRoute();
  }, [navigation.popTransferRoute]);

  const continueIndividualImport = useCallback((): void => {
    if (
      importFlow.conflicts.plan?.type !== 'individual' ||
      importFlow.conflicts.resolvedCount !== importFlow.conflictItems.length ||
      !importFlow.hasActiveSession
    ) {
      return;
    }

    navigation.replaceTransferRoute({
      name: 'import.confirmation',
    });
  }, [
    importFlow.conflictItems.length,
    importFlow.conflicts.plan,
    importFlow.conflicts.resolvedCount,
    importFlow.hasActiveSession,
    navigation.replaceTransferRoute,
  ]);

  const cancelImportConfirmation = useCallback((): void => {
    navigation.popTransferRoute();
  }, [navigation.popTransferRoute]);

  const startConfirmedImport = useCallback((): void => {
    if (importConfirmationSummary === null || !importFlow.hasActiveSession) {
      return;
    }

    navigation.pushTransferRoute({
      name: 'import.progress',
    });
  }, [
    importConfirmationSummary,
    importFlow.hasActiveSession,
    navigation.pushTransferRoute,
  ]);

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

    selectedImportConflictStrategy,
    selectImportConflictStrategy,
    continueImportFromPreview,

    backFromIndividualImportReview,
    continueIndividualImport,

    importConfirmationSummary,
    cancelImportConfirmation,
    startConfirmedImport,

    cancelImportAndPop,
  };
};

export type DiaryTransferController = ReturnType<
  typeof useDiaryTransferController
>;
