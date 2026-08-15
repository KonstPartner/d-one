import { useMemo } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { DiaryStoredExportFile } from '@entities/diary';
import * as ss from '@shared/styles';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  ErrorSection,
  IconButton,
  Input,
  LoadingView,
} from '@shared/ui';

import type { DiaryUnfinishedExport } from '../model/diaryUnfinishedExport';
import {
  type StoredExportListMode,
  useStoredExportList,
} from '../model/useStoredExportList';
import * as s from '../styles/StoredExportList';

import { ExportFileActionsScreen } from './ExportFileActionsScreen';

export type { StoredExportListMode } from '../model/useStoredExportList';

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
  | { type: 'section'; key: 'unfinished' | 'finished'; title: string }
  | { type: 'unfinished'; export: DiaryUnfinishedExport }
  | { type: 'finished'; file: DiaryStoredExportFile };

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
  const list = useStoredExportList({ mode });

  const listItems = useMemo<StoredExportListItem[]>(() => {
    const items: StoredExportListItem[] = [];

    if (list.filteredUnfinishedExports.length > 0) {
      items.push({
        type: 'section',
        key: 'unfinished',
        title: t('transfer.files.unfinishedTitle'),
      });
      items.push(
        ...list.filteredUnfinishedExports.map((item) => ({
          type: 'unfinished' as const,
          export: item,
        }))
      );
    }

    if (list.filteredFinishedExports.length > 0) {
      items.push({
        type: 'section',
        key: 'finished',
        title:
          mode === 'import'
            ? t('transfer.import.createdBackups')
            : t('transfer.files.finishedTitle'),
      });
      items.push(
        ...list.filteredFinishedExports.map((file) => ({
          type: 'finished' as const,
          file,
        }))
      );
    }

    return items;
  }, [list.filteredFinishedExports, list.filteredUnfinishedExports, mode, t]);

  const normalizedSearch = list.search.trim().toLocaleLowerCase();
  const emptyMessage =
    normalizedSearch.length > 0 && list.hasAnyExports
      ? t('transfer.files.noResults')
      : t('transfer.files.empty');

  const renderFinishedFile = (file: DiaryStoredExportFile) => {
    if (mode === 'manage') {
      const selected = list.selectedFinishedFileNames.has(file.fileName);

      return (
        <s.Card>
          <s.FileMain>
            <Checkbox
              checked={selected}
              onPress={() => list.toggleFinished(file.fileName)}
            />

            <s.FileInfo>
              <s.FileName numberOfLines={2} ellipsizeMode="middle">
                {file.fileName}
              </s.FileName>
            </s.FileInfo>

            <IconButton
              icon="open-outline"
              accessibilityLabel={file.fileName}
              disabled={list.operationsDisabled}
              tone="muted"
              variant="solid"
              onPress={() => list.openFinishedExport(file)}
            />
          </s.FileMain>
        </s.Card>
      );
    }

    const selectable = file.kind === 'backup' && onSelectBackup !== undefined;

    return (
      <s.Card>
        <s.FinishedFilePressable
          accessibilityRole={selectable ? 'button' : undefined}
          accessibilityLabel={file.fileName}
          disabled={!selectable || list.operationsDisabled}
          onPress={() => {
            if (selectable) {
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
                name="archive-outline"
                size={22}
                color={theme.colors.text}
              />
            </s.IconBox>

            <s.FileInfo>
              <s.FileName numberOfLines={2} ellipsizeMode="middle">
                {file.fileName}
              </s.FileName>
            </s.FileInfo>

            {selectable && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.muted}
              />
            )}
          </s.FileMain>
        </s.FinishedFilePressable>
      </s.Card>
    );
  };

  const renderUnfinishedFile = (item: DiaryUnfinishedExport) => (
    <s.Card>
      <s.FileMain>
        <s.IconBox>
          <Ionicons
            name={
              item.format === 'csv'
                ? 'document-text-outline'
                : 'archive-outline'
            }
            size={22}
            color={theme.colors.text}
          />
        </s.IconBox>

        <s.FileInfo>
          <s.FileName numberOfLines={2} ellipsizeMode="middle">
            {item.fileName}
          </s.FileName>
          <s.MetaText>{t(getUnfinishedFormatKey(item.format))}</s.MetaText>
          <s.MetaText>{t(getUnfinishedPhaseKey(item.phase))}</s.MetaText>

          {item.phase !== 'planning' && (
            <s.ProgressGroup>
              <s.ProgressText>
                {t('transfer.files.progress.entries', {
                  current: item.processedEntries,
                  total: item.totalEntries,
                })}
              </s.ProgressText>
              {item.totalPhotos > 0 && (
                <s.ProgressText>
                  {t('transfer.files.progress.photos', {
                    current: item.processedPhotos,
                    total: item.totalPhotos,
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
          disabled={list.operationsDisabled}
          loading={list.isExporting && list.resumingExportId === item.exportId}
          onPress={() => void list.resumeExport(item)}
        >
          <s.PrimaryActionText>
            {t('transfer.actions.continue')}
          </s.PrimaryActionText>
        </Button>
        <Button
          tone="danger"
          disabled={list.operationsDisabled}
          onPress={() => list.requestDeleteUnfinished(item.exportId)}
        >
          <s.PrimaryActionText>
            {t('transfer.actions.delete')}
          </s.PrimaryActionText>
        </Button>
      </s.Actions>
    </s.Card>
  );

  const renderItem: ListRenderItem<StoredExportListItem> = ({ item }) => {
    if (item.type === 'section') {
      return (
        <s.SectionTitle style={ss.Subheading(theme)}>
          {item.title}
        </s.SectionTitle>
      );
    }

    return item.type === 'unfinished'
      ? renderUnfinishedFile(item.export)
      : renderFinishedFile(item.file);
  };

  if (list.openedFinishedExport !== null) {
    return (
      <ExportFileActionsScreen
        file={list.openedFinishedExport}
        onBack={list.closeFinishedExport}
      />
    );
  }

  if (list.isLoading) {
    return <LoadingView />;
  }

  if (list.loadError !== null) {
    return (
      <ErrorSection
        message={t('transfer.files.errors.loadFailed')}
        onRetry={() => void list.refresh()}
      />
    );
  }

  return (
    <s.Root>
      <s.Header>
        <IconButton
          icon="arrow-back"
          accessibilityLabel={t('transfer.actions.back')}
          disabled={list.operationsDisabled}
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
          disabled={list.operationsDisabled}
          tone="muted"
          variant="solid"
          onPress={() => void list.refresh()}
        />
      </s.Header>

      <s.Toolbar>
        <Input
          value={list.search}
          onChangeText={list.setSearch}
          placeholder={t('transfer.files.searchPlaceholder')}
          accessibilityLabel={t('transfer.files.searchAccessibilityLabel')}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {mode === 'manage' && list.filteredFinishedExports.length > 0 && (
          <s.SelectionBar>
            <Checkbox
              checked={list.allFilteredFinishedSelected}
              label={
                list.allFilteredFinishedSelected
                  ? t('diary.selection.clearAll')
                  : t('diary.selection.selectAll')
              }
              onPress={list.toggleAllFiltered}
            />
            <s.SelectionMeta>
              {t('diary.selection.selected', { count: list.selectedCount })}
            </s.SelectionMeta>
            <IconButton
              icon="trash-outline"
              accessibilityLabel={t('transfer.actions.delete')}
              disabled={list.operationsDisabled || list.selectedCount === 0}
              tone="danger"
              variant="solid"
              onPress={list.requestDeleteSelected}
            />
          </s.SelectionBar>
        )}
      </s.Toolbar>

      {list.resumeError !== null && (
        <s.ErrorText>{t('transfer.files.errors.resumeFailed')}</s.ErrorText>
      )}
      {list.deleteError !== null && (
        <s.ErrorText>{t('transfer.files.errors.deleteFailed')}</s.ErrorText>
      )}

      <FlatList
        data={listItems}
        keyExtractor={(item) => {
          if (item.type === 'section') {
            return `section:${item.key}`;
          }
          if (item.type === 'unfinished') {
            return `unfinished:${item.export.exportId}`;
          }

          return `finished:${item.file.fileName}`;
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
        visible={list.deleteTarget !== null}
        title={t(
          list.deleteTarget?.type === 'unfinished'
            ? 'transfer.files.deleteUnfinishedTitle'
            : 'transfer.files.deleteFinishedTitle'
        )}
        description={t(
          list.deleteTarget?.type === 'unfinished'
            ? 'transfer.files.deleteUnfinishedDescription'
            : 'transfer.files.deleteFinishedDescription'
        )}
        confirmLabel={t('transfer.actions.delete')}
        confirmTone="danger"
        confirmDisabled={list.isDeleting}
        onConfirm={list.confirmDelete}
        onClose={list.closeDeleteDialog}
      />
    </s.Root>
  );
};
