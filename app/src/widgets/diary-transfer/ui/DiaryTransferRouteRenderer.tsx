import { StoredExportList } from '@features/export-diary';

import type { DiaryTransferController } from '../model/useDiaryTransferController';

import { ExportFormatStep } from './ExportFormatStep';
import { ExportPeriodStep } from './ExportPeriodStep';
import { ExportProgressResultScreen } from './ExportProgressResultScreen';
import { ExportScopeStep } from './ExportScopeStep';
import { ExportSelectedEntriesStep } from './ExportSelectedEntriesStep';
import { ImportChooseFileStep } from './ImportChooseFileStep';
import { TransferHomeStep } from './TransferHomeStep';

type DiaryTransferRouteRendererProps = {
  controller: DiaryTransferController;

  onClose: () => void;
};

export const DiaryTransferRouteRenderer = ({
  controller,
  onClose,
}: DiaryTransferRouteRendererProps) => {
  const { transferState, exportFlow, navigation, startExport } = controller;

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
          disabled={navigation.locked}
          devicePickerDisabled
          onBack={navigation.popRoute}
          onChooseFromDevice={() => undefined}
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
      return <StoredExportList mode="import" onBack={navigation.popRoute} />;
  }
};
