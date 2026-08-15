import { useMemo, useState } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { DiaryStoredExportFile } from '@entities/diary';
import * as ss from '@shared/styles';
import {
  Button,
  ConfirmDialog,
  ErrorSection,
  IconButton,
  Input,
  LoadingView,
} from '@shared/ui';

import { useDiaryExportFiles } from '../api/useDiaryExportFiles';
import { useDiaryExportMutation } from '../api/useDiaryExportMutation';
import type { DiaryUnfinishedExport } from '../model/diaryUnfinishedExport';
import * as s from '../styles/StoredExportList';

export type StoredExportListMode = 'manage' | 'import';

export type StoredExportSelection = {
  fileName: string;
  fileUri: string;
};

type StoredExportListProps = {
  mode: StoredExportListMode;

  onBack: () => void;
  onSelectBackup?: (file: StoredExportSelection) => void;
};

type StoredExportListItem =
  | {
      type: 'section';
      key: 'unfinished' | 'finished';
      title: string;
    }
  | {
      type: 'unfinished';
      export: DiaryUnfinishedExport;
    }
  | {
      type: 'finished';
      file: DiaryStoredExportFile;
    };

type DeleteTarget =
  | {
      type: 'unfinished';
      exportId: string;
    }
  | {
      type: 'finished';
      fileName: string;
    };

const getUnfinishedFormatKey = (
  format: DiaryUnfinishedExport['format']
):
  | 'transfer.files.formats.fullBackup'
  | 'transfer.files.formats.lightweightBackup'
  | 'transfer.files.formats.csv' => {
  switch (format) {
    case 'fullBackup':
      return 'transfer.files.formats.fullBackup';

    case 'lightweightBackup':
      return 'transfer.files.formats.lightweightBackup';

    case 'csv':
      return 'transfer.files.formats.csv';
  }
};

const getUnfinishedPhaseKey = (
  phase: DiaryUnfinishedExport['phase']
):
  | 'transfer.files.phases.planning'
  | 'transfer.files.phases.processing'
  | 'transfer.files.phases.readyToFinalize' => {
  switch (phase) {
    case 'planning':
      return 'transfer.files.phases.planning';

    case 'processing':
      return 'transfer.files.phases.processing';

    case 'readyToFinalize':
      return 'transfer.files.phases.readyToFinalize';
  }
};

export const StoredExportList = ({
  mode,
  onBack,
  onSelectBackup,
}: StoredExportListProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [resumingExportId, setResumingExportId] = useState<string | null>(null);

  const {
    finishedExports,
    unfinishedExports,

    isLoading,
    isRefreshing,
    loadError,

    refresh,

    deleteFinishedExports,
    deleteUnfinishedExport,

    isDeleting,
    deleteError,
    resetDelete,
  } = useDiaryExportFiles();

  const {
    resumeDiaryExport,
    isExporting,
    error: resumeError,
    reset: resetExport,
  } = useDiaryExportMutation();

  const normalizedSearch = search.trim().toLocaleLowerCase();

  const filteredFinishedExports = useMemo(
    () =>
      finishedExports.filter((file) => {
        if (mode === 'import' && file.kind !== 'backup') {
          return false;
        }

        return (
          normalizedSearch.length === 0 ||
          file.fileName.toLocaleLowerCase().includes(normalizedSearch)
        );
      }),
    [finishedExports, mode, normalizedSearch]
  );

  const filteredUnfinishedExports = useMemo(
    () =>
      mode === 'manage'
        ? unfinishedExports.filter(
            (item) =>
              normalizedSearch.length === 0 ||
              item.fileName.toLocaleLowerCase().includes(normalizedSearch)
          )
        : [],
    [mode, normalizedSearch, unfinishedExports]
  );

  const listItems = useMemo<StoredExportListItem[]>(() => {
    const items: StoredExportListItem[] = [];

    if (filteredUnfinishedExports.length > 0) {
      items.push({
        type: 'section',
        key: 'unfinished',
        title: t('transfer.files.unfinishedTitle'),
      });

      items.push(
        ...filteredUnfinishedExports.map(
          (item): StoredExportListItem => ({
            type: 'unfinished',
            export: item,
          })
        )
      );
    }

    if (filteredFinishedExports.length > 0) {
      items.push({
        type: 'section',
        key: 'finished',
        title:
          mode === 'import'
            ? t('transfer.import.createdBackups')
            : t('transfer.files.finishedTitle'),
      });

      items.push(
        ...filteredFinishedExports.map(
          (file): StoredExportListItem => ({
            type: 'finished',
            file,
          })
        )
      );
    }

    return items;
  }, [filteredFinishedExports, filteredUnfinishedExports, mode, t]);

  const operationsDisabled = isExporting || isDeleting || isRefreshing;

  const hasAnyExports =
    mode === 'manage'
      ? finishedExports.length > 0 || unfinishedExports.length > 0
      : finishedExports.some((file) => file.kind === 'backup');

  const emptyMessage =
    normalizedSearch.length > 0 && hasAnyExports
      ? t('transfer.files.noResults')
      : t('transfer.files.empty');

  const handleResume = async (item: DiaryUnfinishedExport): Promise<void> => {
    resetExport();
    setResumingExportId(item.exportId);

    try {
      await resumeDiaryExport(item.exportId);
    } catch {
      return;
    } finally {
      setResumingExportId(null);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteTarget === null) {
      return;
    }

    resetDelete();

    try {
      if (deleteTarget.type === 'unfinished') {
        await deleteUnfinishedExport(deleteTarget.exportId);
      } else {
        await deleteFinishedExports([deleteTarget.fileName]);
      }

      setDeleteTarget(null);
    } catch {
      return;
    }
  };

  const renderItem: ListRenderItem<StoredExportListItem> = ({ item }) => {
    if (item.type === 'section') {
      return (
        <s.SectionTitle style={ss.Subheading(theme)}>
          {item.title}
        </s.SectionTitle>
      );
    }

    if (item.type === 'unfinished') {
      const exportItem = item.export;

      return (
        <s.Card>
          <s.FileMain>
            <s.IconBox>
              <Ionicons
                name={
                  exportItem.format === 'csv'
                    ? 'document-text-outline'
                    : 'archive-outline'
                }
                size={22}
                color={theme.colors.text}
              />
            </s.IconBox>

            <s.FileInfo>
              <s.FileName numberOfLines={2}>{exportItem.fileName}</s.FileName>

              <s.MetaText>
                {t(getUnfinishedFormatKey(exportItem.format))}
              </s.MetaText>

              <s.MetaText>
                {t(getUnfinishedPhaseKey(exportItem.phase))}
              </s.MetaText>

              {exportItem.phase !== 'planning' && (
                <s.ProgressGroup>
                  <s.ProgressText>
                    {t('transfer.files.progress.entries', {
                      current: exportItem.processedEntries,
                      total: exportItem.totalEntries,
                    })}
                  </s.ProgressText>

                  {exportItem.totalPhotos > 0 && (
                    <s.ProgressText>
                      {t('transfer.files.progress.photos', {
                        current: exportItem.processedPhotos,
                        total: exportItem.totalPhotos,
                      })}
                    </s.ProgressText>
                  )}
                </s.ProgressGroup>
              )}
            </s.FileInfo>
          </s.FileMain>

          <s.Actions>
            <Button
              tone="primary"
              disabled={operationsDisabled}
              loading={isExporting && resumingExportId === exportItem.exportId}
              onPress={() => {
                void handleResume(exportItem);
              }}
            >
              <s.PrimaryActionText>
                {t('transfer.actions.continue')}
              </s.PrimaryActionText>
            </Button>

            <Button
              tone="danger"
              disabled={operationsDisabled}
              onPress={() => {
                resetDelete();

                setDeleteTarget({
                  type: 'unfinished',
                  exportId: exportItem.exportId,
                });
              }}
            >
              <s.PrimaryActionText>
                {t('transfer.actions.delete')}
              </s.PrimaryActionText>
            </Button>
          </s.Actions>
        </s.Card>
      );
    }

    const { file } = item;

    const isBackup = file.kind === 'backup';

    const backupSelectionEnabled = isBackup && onSelectBackup !== undefined;

    return (
      <s.Card>
        <s.FinishedFilePressable
          accessibilityRole={backupSelectionEnabled ? 'button' : undefined}
          accessibilityLabel={file.fileName}
          disabled={!backupSelectionEnabled || operationsDisabled}
          onPress={() => {
            if (isBackup && onSelectBackup !== undefined) {
              onSelectBackup({
                fileName: file.fileName,
                fileUri: file.fileUri,
              });
            }
          }}
          style={s.getFilePressableStyle}
        >
          <s.FileMain>
            <s.IconBox>
              <Ionicons
                name={isBackup ? 'archive-outline' : 'document-text-outline'}
                size={22}
                color={theme.colors.text}
              />
            </s.IconBox>

            <s.FileInfo>
              <s.FileName numberOfLines={2}>{file.fileName}</s.FileName>
            </s.FileInfo>

            {backupSelectionEnabled && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.muted}
              />
            )}
          </s.FileMain>
        </s.FinishedFilePressable>

        {mode === 'manage' && (
          <s.FinishedActions>
            <IconButton
              icon="trash-outline"
              accessibilityLabel={t('transfer.actions.delete')}
              disabled={operationsDisabled}
              tone="danger"
              variant="solid"
              onPress={() => {
                resetDelete();

                setDeleteTarget({
                  type: 'finished',
                  fileName: file.fileName,
                });
              }}
            />
          </s.FinishedActions>
        )}
      </s.Card>
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (loadError !== null) {
    return (
      <ErrorSection
        message={t('transfer.files.errors.loadFailed')}
        onRetry={() => {
          void refresh();
        }}
      />
    );
  }

  return (
    <s.Root>
      <s.Header>
        <IconButton
          icon="arrow-back"
          accessibilityLabel={t('transfer.actions.back')}
          disabled={operationsDisabled}
          tone="muted"
          variant="solid"
          onPress={onBack}
        />

        <s.Title style={ss.Heading(theme)}>
          {t(
            mode === 'import'
              ? 'transfer.files.importTitle'
              : 'transfer.files.manageTitle'
          )}
        </s.Title>

        <IconButton
          icon="refresh"
          accessibilityLabel={t('transfer.actions.refresh')}
          disabled={operationsDisabled}
          tone="muted"
          variant="solid"
          onPress={() => {
            void refresh();
          }}
        />
      </s.Header>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder={t('transfer.files.searchPlaceholder')}
        accessibilityLabel={t('transfer.files.searchAccessibilityLabel')}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {resumeError !== null && (
        <s.ErrorText>{t('transfer.files.errors.resumeFailed')}</s.ErrorText>
      )}

      {deleteError !== null && (
        <s.ErrorText>{t('transfer.files.errors.deleteFailed')}</s.ErrorText>
      )}

      <FlatList
        data={listItems}
        keyExtractor={(item) => {
          switch (item.type) {
            case 'section':
              return `section:${item.key}`;

            case 'unfinished':
              return `unfinished:${item.export.exportId}`;

            case 'finished':
              return `finished:${item.file.fileName}`;
          }
        }}
        renderItem={renderItem}
        contentContainerStyle={s.getListContentStyle(
          theme,
          listItems.length === 0
        )}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <s.EmptyText style={ss.Text(theme)}>{emptyMessage}</s.EmptyText>
        }
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t(
          deleteTarget?.type === 'unfinished'
            ? 'transfer.files.deleteUnfinishedTitle'
            : 'transfer.files.deleteFinishedTitle'
        )}
        description={t(
          deleteTarget?.type === 'unfinished'
            ? 'transfer.files.deleteUnfinishedDescription'
            : 'transfer.files.deleteFinishedDescription'
        )}
        confirmLabel={t('transfer.actions.delete')}
        confirmTone="danger"
        confirmDisabled={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
      />
    </s.Root>
  );
};
