import { StoredExportList } from '@features/export-diary';

import type { DiaryTransferController } from '../model/useDiaryTransferController';

import { ExportFormatStep } from './ExportFormatStep';
import { ExportPeriodStep } from './ExportPeriodStep';
import { ExportProgressResultScreen } from './ExportProgressResultScreen';
import { ExportScopeStep } from './ExportScopeStep';
import { ExportSelectedEntriesStep } from './ExportSelectedEntriesStep';
import { ImportChooseFileStep } from './ImportChooseFileStep';
import { ImportConfirmationStep } from './ImportConfirmationStep';
import { ImportConflictReviewStep } from './ImportConflictReviewStep';
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
    selectedImportConflictStrategy,
    selectImportConflictStrategy,
    continueImportFromPreview,
    backFromIndividualImportReview,
    continueIndividualImport,
    importConfirmationSummary,
    cancelImportConfirmation,
    startConfirmedImport,
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
            navigation.pushRoute({ name: 'export.format' });
          }}
          onImport={() => {
            navigation.pushRoute({ name: 'import.choose-file' });
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
            navigation.pushRoute({ name: 'saved-exports.manage' });
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
              scope: { type: 'all' },
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
            navigation.pushRoute({ name: 'saved-exports.import' });
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
          isPreparing={importFlow.isPreparing}
          transferPhase={transferState.phase}
          processedEntries={transferState.processedEntries}
          totalEntries={transferState.totalEntries}
          selectedConflictStrategy={selectedImportConflictStrategy}
          onPrepare={prepareImportPreview}
          onSelectConflictStrategy={selectImportConflictStrategy}
          onCancel={cancelImportAndPop}
          onPreparationFailed={cancelImportAndPop}
          onContinue={continueImportFromPreview}
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

    case 'import.confirmation':
      if (importConfirmationSummary === null) {
        return null;
      }

      return (
        <ImportConfirmationStep
          summary={importConfirmationSummary}
          onCancel={cancelImportConfirmation}
          onStart={startConfirmedImport}
        />
      );

    case 'import.progress':
      return (
        <ImportProgressResultScreen
          transferState={transferState}
          result={importFlow.result}
          onDone={onClose}
        />
      );
  }
};
