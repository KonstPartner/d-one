import { StoredExportList } from '@features/export-diary';

import type { DiaryTransferController } from '../model/useDiaryTransferController';

import { ExportFormatStep } from './ExportFormatStep';
import { ExportPeriodStep } from './ExportPeriodStep';
import { ExportProgressResultScreen } from './ExportProgressResultScreen';
import { ExportScopeStep } from './ExportScopeStep';
import { ExportSelectedEntriesStep } from './ExportSelectedEntriesStep';
import { ImportChooseFileStep } from './ImportChooseFileStep';
import { ImportConflictReviewStep } from './ImportConflictReviewStep';
import { ImportConflictStrategyStep } from './ImportConflictStrategyStep';
import { ImportPreviewStep } from './ImportPreviewStep';
import { ImportProgressResultScreen } from './ImportProgressResultScreen';
import { TransferHomeStep } from './TransferHomeStep';

type DiaryTransferRouteRendererProps = {
  controller: DiaryTransferController;

  onClose: () => void;
};

export const DiaryTransferRouteRenderer = ({
  controller,
  onClose,
}: DiaryTransferRouteRendererProps) => {
  const {
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
  } = controller;

  const { currentRoute } = navigation;

  switch (currentRoute.name) {
    case 'home':
      return (
        <TransferHomeStep
          disabled={navigation.locked}
          onClose={onClose}
          onExport={() => {
            navigation.pushRoute({
              name: 'export.format',
            });
          }}
          onImport={() => {
            navigation.pushRoute({
              name: 'import.choose-file',
            });
          }}
        />
      );

    case 'export.format':
      return (
        <ExportFormatStep
          disabled={navigation.locked}
          onBack={navigation.popRoute}
          onSelectFormat={(format) => {
            exportFlow.resetExport();

            navigation.pushRoute({
              name: 'export.scope',
              format,
            });
          }}
          onOpenCreatedExports={() => {
            navigation.pushRoute({
              name: 'saved-exports.manage',
            });
          }}
        />
      );

    case 'export.scope':
      return (
        <ExportScopeStep
          format={currentRoute.format}
          disabled={navigation.locked}
          allDisabled={!exportFlow.canExport}
          onBack={navigation.popRoute}
          onExportAll={() => {
            void startExport({
              format: currentRoute.format,

              scope: {
                type: 'all',
              },
            });
          }}
          onSelectPeriod={() => {
            exportFlow.resetExport();

            navigation.pushRoute({
              name: 'export.period',
              format: currentRoute.format,
            });
          }}
          onSelectEntries={() => {
            exportFlow.resetExport();

            navigation.pushRoute({
              name: 'export.selected',
              format: currentRoute.format,
            });
          }}
        />
      );

    case 'export.period':
      return (
        <ExportPeriodStep
          disabled={navigation.locked}
          onBack={navigation.popRoute}
          onExport={(scope) =>
            startExport({
              format: currentRoute.format,

              scope,
            })
          }
        />
      );

    case 'export.selected':
      return (
        <ExportSelectedEntriesStep
          disabled={navigation.locked}
          onBack={navigation.popRoute}
          onExport={(entryIds) =>
            startExport({
              format: currentRoute.format,

              scope: {
                type: 'selected',
                entryIds,
              },
            })
          }
        />
      );

    case 'export.progress':
      return (
        <ExportProgressResultScreen
          format={currentRoute.format}
          transferState={transferState}
          result={exportFlow.result}
          error={exportFlow.error}
          empty={exportFlow.empty}
          onBack={navigation.popRoute}
          onDone={onClose}
        />
      );

    case 'import.choose-file':
      return (
        <ImportChooseFileStep
          disabled={navigation.locked || importFlow.isPicking}
          devicePickerDisabled={
            importFlow.isPreparing ||
            importFlow.isImporting ||
            importFlow.hasActiveSession
          }
          onBack={navigation.popRoute}
          onChooseFromDevice={() => {
            void chooseImportFromDevice();
          }}
          onOpenCreatedBackups={() => {
            navigation.pushRoute({
              name: 'saved-exports.import',
            });
          }}
        />
      );

    case 'saved-exports.manage':
      return <StoredExportList mode="manage" onBack={navigation.popRoute} />;

    case 'saved-exports.import':
      return (
        <StoredExportList
          mode="import"
          onBack={navigation.popRoute}
          onSelectBackup={(backup) => {
            openImportPreview({
              fileName: backup.fileName,
              fileUri: backup.fileUri,
            });
          }}
        />
      );

    case 'import.preview':
      return (
        <ImportPreviewStep
          source={currentRoute.source}
          preview={importFlow.preview}
          error={importFlow.error}
          isPreparing={importFlow.isPreparing}
          transferPhase={transferState.phase}
          processedEntries={transferState.processedEntries}
          totalEntries={transferState.totalEntries}
          onPrepare={prepareImportPreview}
          onCancel={cancelImportAndPop}
          onContinue={
            importFlow.preview === null ? undefined : continueImportFromPreview
          }
        />
      );

    case 'import.conflicts':
      return (
        <ImportConflictStrategyStep
          matchesCount={importFlow.preview?.matchesCount ?? 0}
          disabled={importFlow.isImporting}
          onBack={backFromImportConflicts}
          onSkipAll={() => {
            resolveAllImportConflicts('skip');
          }}
          onReplaceAll={() => {
            resolveAllImportConflicts('replace');
          }}
          onReviewIndividually={openIndividualImportReview}
        />
      );

    case 'import.review':
      return (
        <ImportConflictReviewStep
          items={importFlow.conflictItems}
          resolvedCount={importFlow.conflicts.resolvedCount}
          getDecision={importFlow.conflicts.getDecision}
          onSetDecision={importFlow.conflicts.setIndividualDecision}
          onBack={backFromIndividualImportReview}
          onContinue={continueIndividualImport}
        />
      );

    case 'import.progress':
      return (
        <ImportProgressResultScreen
          transferState={transferState}
          result={importFlow.result}
          error={importFlow.error}
          onDone={onClose}
        />
      );
  }
};
