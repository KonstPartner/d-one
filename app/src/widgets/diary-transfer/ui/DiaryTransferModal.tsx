import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  type DiaryCsvLocalization,
  type DiaryExportFormat,
  type DiaryExportScope,
  StoredExportList,
  useDiaryExportMutation,
} from '@features/export-diary';
import { useDiaryTransferState } from '@entities/diary';
import { useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';
import { normalizeAppLanguage } from '@shared/i18n';
import * as ss from '@shared/styles';
import { IconButton, PortalModal, Spinner } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

import { ExportPeriodScreen } from './ExportPeriodScreen';
import { ExportSelectedEntriesScreen } from './ExportSelectedEntriesScreen';

type DiaryTransferRoute =
  | {
      name: 'home';
    }
  | {
      name: 'export.format';
    }
  | {
      name: 'export.scope';
      format: DiaryExportFormat;
    }
  | {
      name: 'export.period';
      format: DiaryExportFormat;
    }
  | {
      name: 'export.selected';
      format: DiaryExportFormat;
    }
  | {
      name: 'saved-exports.manage';
    }
  | {
      name: 'import.choose-file';
    }
  | {
      name: 'saved-exports.import';
    };

type DiaryTransferModalProps = {
  visible: boolean;
  onClose: () => void;
};

const INITIAL_ROUTE: DiaryTransferRoute = {
  name: 'home',
};

const isTransferNavigationLocked = (
  phase: ReturnType<typeof useDiaryTransferState>['phase']
): boolean => {
  switch (phase) {
    case 'waitingForSync':
    case 'validating':
    case 'resolvingConflicts':
    case 'processing':
      return true;

    case 'idle':
    case 'completed':
    case 'failed':
      return false;
  }
};

export const DiaryTransferModal = ({
  visible,
  onClose,
}: DiaryTransferModalProps) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const { sessionUser } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery(userProfileQueryOptions(userId));

  const userName = profileQuery.data?.nickname ?? '';

  const transferState = useDiaryTransferState();

  const {
    exportDiary,
    isExporting,
    error: exportError,
    reset: resetExport,
  } = useDiaryExportMutation();

  const [routeStack, setRouteStack] = useState<DiaryTransferRoute[]>([
    INITIAL_ROUTE,
  ]);

  const [exportEmpty, setExportEmpty] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRouteStack([INITIAL_ROUTE]);
      setExportEmpty(false);
      resetExport();
    }
  }, [resetExport, visible]);

  const currentRoute = routeStack[routeStack.length - 1] ?? INITIAL_ROUTE;

  const navigationLocked =
    isTransferNavigationLocked(transferState.phase) || isExporting;

  const pushRoute = (route: DiaryTransferRoute): void => {
    if (navigationLocked) {
      return;
    }

    setRouteStack((current) => [...current, route]);
  };

  const popRoute = (): void => {
    if (navigationLocked) {
      return;
    }

    setRouteStack((current) =>
      current.length > 1 ? current.slice(0, -1) : current
    );
  };

  const handleRequestClose = (): void => {
    if (navigationLocked) {
      return;
    }

    if (routeStack.length > 1) {
      popRoute();

      return;
    }

    onClose();
  };

  const buildCsvLocalization = (): DiaryCsvLocalization => ({
    language: normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language),

    headers: {
      eventAt: t('transfer.export.csvHeaders.eventAt'),

      glucose: t('transfer.export.csvHeaders.glucose'),

      mealRelation: t('transfer.export.csvHeaders.mealRelation'),

      shortInsulin: t('transfer.export.csvHeaders.shortInsulin'),

      longInsulin: t('transfer.export.csvHeaders.longInsulin'),

      carbsGram: t('transfer.export.csvHeaders.carbsGram'),

      comment: t('transfer.export.csvHeaders.comment'),

      aiAnalysis: t('transfer.export.csvHeaders.aiAnalysis'),

      photoUrl: t('transfer.export.csvHeaders.photoUrl'),
    },

    mealRelations: {
      beforeMeal: t('diary.entry.mealRelation.beforeMeal'),

      afterMeal: t('diary.entry.mealRelation.afterMeal'),

      fasting: t('diary.entry.mealRelation.fasting'),

      bedtime: t('diary.entry.mealRelation.bedtime'),

      night: t('diary.entry.mealRelation.night'),
    },
  });

  const handleExport = async ({
    format,
    scope,
  }: {
    format: DiaryExportFormat;
    scope: DiaryExportScope;
  }): Promise<void> => {
    if (userName.length === 0) {
      return;
    }

    resetExport();
    setExportEmpty(false);

    try {
      const result =
        format === 'csv'
          ? await exportDiary({
              format: 'csv',
              userName,

              scope,

              localization: buildCsvLocalization(),
            })
          : await exportDiary({
              format,
              userName,

              scope,
            });

      if (result === null) {
        setExportEmpty(true);

        return;
      }

      pushRoute({
        name: 'saved-exports.manage',
      });
    } catch {
      return;
    }
  };

  const renderHeader = ({
    title,
    back = false,
  }: {
    title: string;
    back?: boolean;
  }) => (
    <s.Header>
      <s.HeaderSide>
        {back ? (
          <IconButton
            icon="arrow-back"
            accessibilityLabel={t('transfer.actions.back')}
            disabled={navigationLocked}
            tone="muted"
            variant="solid"
            onPress={popRoute}
          />
        ) : null}
      </s.HeaderSide>

      <s.Title style={ss.Heading(theme)}>{title}</s.Title>

      <s.HeaderSide $align="end">
        {!back ? (
          <IconButton
            icon="close"
            accessibilityLabel={t('common.close')}
            disabled={navigationLocked}
            tone="muted"
            variant="solid"
            onPress={onClose}
          />
        ) : null}
      </s.HeaderSide>
    </s.Header>
  );

  const renderOption = ({
    icon,
    title,
    description,
    disabled = false,
    onPress,
  }: {
    icon:
      | 'download-outline'
      | 'arrow-up-outline'
      | 'archive-outline'
      | 'document-text-outline'
      | 'folder-open-outline'
      | 'albums-outline'
      | 'calendar-outline'
      | 'checkbox-outline';

    title: string;
    description?: string;

    disabled?: boolean;

    onPress: () => void;
  }) => (
    <s.OptionButton
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: disabled || navigationLocked,
      }}
      disabled={disabled || navigationLocked}
      $disabled={disabled || navigationLocked}
      onPress={onPress}
      style={disabled || navigationLocked ? undefined : s.getOptionButtonStyle}
    >
      <s.OptionIcon style={ss.CenterContent}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
      </s.OptionIcon>

      <s.OptionContent>
        <s.OptionTitle>{title}</s.OptionTitle>

        {description ? (
          <s.OptionDescription>{description}</s.OptionDescription>
        ) : null}
      </s.OptionContent>

      {!disabled ? (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      ) : null}
    </s.OptionButton>
  );

  const renderExportState = () => {
    if (isExporting) {
      const hasProgress =
        transferState.phase === 'processing' && transferState.totalEntries > 0;

      return (
        <s.Options>
          <Spinner size={28} />

          <s.OptionDescription>
            {hasProgress
              ? t('transfer.export.status.progress', {
                  current: transferState.processedEntries,
                  total: transferState.totalEntries,
                })
              : t('transfer.export.status.preparing')}
          </s.OptionDescription>
        </s.Options>
      );
    }

    if (exportError !== null) {
      return (
        <s.OptionDescription>
          {t('transfer.export.errors.failed')}
        </s.OptionDescription>
      );
    }

    if (exportEmpty) {
      return (
        <s.OptionDescription>
          {t('transfer.export.errors.empty')}
        </s.OptionDescription>
      );
    }

    return null;
  };

  const renderCurrentRoute = () => {
    switch (currentRoute.name) {
      case 'home':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.title'),
            })}

            <s.Options>
              {renderOption({
                icon: 'download-outline',

                title: t('transfer.actions.export'),

                onPress: () => {
                  pushRoute({
                    name: 'export.format',
                  });
                },
              })}

              {renderOption({
                icon: 'arrow-up-outline',

                title: t('transfer.actions.import'),

                onPress: () => {
                  pushRoute({
                    name: 'import.choose-file',
                  });
                },
              })}
            </s.Options>
          </s.Screen>
        );

      case 'export.format':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.export.title'),

              back: true,
            })}

            <s.Options>
              {renderOption({
                icon: 'archive-outline',

                title: t('transfer.export.fullBackup'),

                description: t('transfer.export.fullBackupDescription'),

                onPress: () => {
                  resetExport();
                  setExportEmpty(false);

                  pushRoute({
                    name: 'export.scope',
                    format: 'fullBackup',
                  });
                },
              })}

              {renderOption({
                icon: 'archive-outline',

                title: t('transfer.export.lightweightBackup'),

                description: t('transfer.export.lightweightBackupDescription'),

                onPress: () => {
                  resetExport();
                  setExportEmpty(false);

                  pushRoute({
                    name: 'export.scope',
                    format: 'lightweightBackup',
                  });
                },
              })}

              {renderOption({
                icon: 'document-text-outline',

                title: t('transfer.export.csv'),

                description: t('transfer.export.csvDescription'),

                onPress: () => {
                  resetExport();
                  setExportEmpty(false);

                  pushRoute({
                    name: 'export.scope',
                    format: 'csv',
                  });
                },
              })}

              {renderOption({
                icon: 'folder-open-outline',

                title: t('transfer.export.createdExports'),

                onPress: () => {
                  pushRoute({
                    name: 'saved-exports.manage',
                  });
                },
              })}
            </s.Options>
          </s.Screen>
        );

      case 'export.scope':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.export.scope.title'),

              back: true,
            })}

            <s.Options>
              {renderOption({
                icon: 'albums-outline',

                title: t('transfer.export.scope.all'),

                description: t('transfer.export.scope.allDescription'),

                disabled: userName.length === 0,

                onPress: () => {
                  void handleExport({
                    format: currentRoute.format,

                    scope: {
                      type: 'all',
                    },
                  });
                },
              })}

              {renderOption({
                icon: 'calendar-outline',

                title: t('transfer.export.scope.period'),

                description: t('transfer.export.scope.periodDescription'),

                onPress: () => {
                  resetExport();
                  setExportEmpty(false);

                  pushRoute({
                    name: 'export.period',
                    format: currentRoute.format,
                  });
                },
              })}

              {renderOption({
                icon: 'checkbox-outline',

                title: t('transfer.export.scope.selected'),

                description: t('transfer.export.scope.selectedDescription'),

                onPress: () => {
                  resetExport();
                  setExportEmpty(false);

                  pushRoute({
                    name: 'export.selected',
                    format: currentRoute.format,
                  });
                },
              })}
            </s.Options>

            {renderExportState()}
          </s.Screen>
        );

      case 'export.period':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.export.scope.period'),

              back: true,
            })}

            <ExportPeriodScreen
              disabled={navigationLocked}
              onExport={(scope) =>
                handleExport({
                  format: currentRoute.format,
                  scope,
                })
              }
            />

            {renderExportState()}
          </s.Screen>
        );

      case 'export.selected':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.export.scope.selected'),

              back: true,
            })}

            <ExportSelectedEntriesScreen
              disabled={navigationLocked}
              onExport={(entryIds) =>
                handleExport({
                  format: currentRoute.format,

                  scope: {
                    type: 'selected',
                    entryIds,
                  },
                })
              }
            />

            {renderExportState()}
          </s.Screen>
        );

      case 'import.choose-file':
        return (
          <s.Screen>
            {renderHeader({
              title: t('transfer.import.title'),

              back: true,
            })}

            <s.Options>
              {renderOption({
                icon: 'arrow-up-outline',

                title: t('transfer.import.chooseFromDevice'),

                disabled: true,

                onPress: () => undefined,
              })}

              {renderOption({
                icon: 'folder-open-outline',

                title: t('transfer.import.createdBackups'),

                onPress: () => {
                  pushRoute({
                    name: 'saved-exports.import',
                  });
                },
              })}
            </s.Options>
          </s.Screen>
        );

      case 'saved-exports.manage':
        return <StoredExportList mode="manage" onBack={popRoute} />;

      case 'saved-exports.import':
        return <StoredExportList mode="import" onBack={popRoute} />;
    }
  };

  return (
    <PortalModal
      visible={visible}
      onClose={handleRequestClose}
      withoutScroll
      withoutCloseBtn
      isDisabled={navigationLocked}
    >
      <s.Root>{renderCurrentRoute()}</s.Root>
    </PortalModal>
  );
};
