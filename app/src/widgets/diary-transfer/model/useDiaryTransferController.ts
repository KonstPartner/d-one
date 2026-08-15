import { useEffect } from 'react';

import type {
  DiaryExportFormat,
  DiaryExportScope,
} from '@features/export-diary';
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

  const navigation = useDiaryTransferNavigation({
    visible,

    transferPhase: transferState.phase,

    operationPending: exportFlow.isExporting,

    onClose,
  });

  useEffect(() => {
    if (!visible) {
      exportFlow.resetExport();
    }
  }, [exportFlow.resetExport, visible]);

  const startExport = async ({
    format,
    scope,
  }: StartDiaryTransferExportInput): Promise<void> => {
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
  };

  return {
    transferState,
    exportFlow,
    navigation,

    startExport,
  };
};

export type DiaryTransferController = ReturnType<
  typeof useDiaryTransferController
>;
