import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { CreateDiaryEntryModal } from '@features/create-diary-entry';
import { EditDiaryEntryModal } from '@features/edit-diary-entry';
import { DiaryFiltersModal } from '@features/filter-diary-entries';
import { OwnerDiaryHelp } from '@features/screen-help';
import { DiarySearch } from '@features/search-diary-entries';
import {
  type DiaryDayKey,
  type DiaryEntry,
  DiaryLocalList,
  DiaryPhotoViewer,
  getDiaryDayKey,
  useDiaryTransferState,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';
import { useCollapsibleToolbarVisibility } from '@shared/lib/react';
import * as ss from '@shared/styles';
import { ConfirmDialog, Spinner } from '@shared/ui';

import { useOwnerDiary } from '../model/useOwnerDiary';
import { useOwnerDiaryEntryEditor } from '../model/useOwnerDiaryEntryEditor';
import { useOwnerDiaryHeaderMenu } from '../model/useOwnerDiaryHeaderMenu';
import { useOwnerDiaryPreparation } from '../model/useOwnerDiaryPreparation';
import { useOwnerDiarySelection } from '../model/useOwnerDiarySelection';
import { useOwnerDiarySync } from '../model/useOwnerDiarySync';
import * as s from '../styles/OwnerDiary';

import { OwnerDiaryPreparationModal } from './OwnerDiaryPreparationModal';
import { OwnerDiarySelectionToolbar } from './OwnerDiarySelectionToolbar';

export const OwnerDiary = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const diary = useOwnerDiary();

  const diarySync = useOwnerDiarySync();

  const diaryPreparation = useOwnerDiaryPreparation();

  const toolbar = useCollapsibleToolbarVisibility();

  const transfer = useDiaryTransferState();

  const transferLocked =
    transfer.phase === 'waitingForSync' ||
    transfer.phase === 'validating' ||
    transfer.phase === 'resolvingConflicts' ||
    transfer.phase === 'processing';

  const [photoViewerEntry, setPhotoViewerEntry] = useState<DiaryEntry | null>(
    null
  );

  const entryEditor = useOwnerDiaryEntryEditor({
    onEntrySaved: diaryPreparation.handleEntrySaved,
  });

  const currentPageEntries = diary.list.page?.items ?? [];

  const currentPageDayKeys = useMemo<ReadonlyArray<DiaryDayKey>>(() => {
    const dayKeys = new Set<DiaryDayKey>();

    for (const entry of currentPageEntries) {
      dayKeys.add(getDiaryDayKey(entry.eventAt));
    }

    return Array.from(dayKeys);
  }, [currentPageEntries]);

  const availableEntryIds = useMemo<ReadonlySet<string>>(() => {
    const entryIds = new Set<string>();

    for (const entry of currentPageEntries) {
      if (
        entry.syncStatus === 'pendingDelete' ||
        diarySync.isEntrySyncing(entry.id)
      ) {
        continue;
      }

      entryIds.add(entry.id);
    }

    return entryIds;
  }, [currentPageEntries, diarySync.isEntrySyncing, diarySync.syncingEntryIds]);

  const handleEntriesMarkedForDeletion = useCallback(
    async (entryIds: ReadonlyArray<string>): Promise<void> => {
      const physicallyDeleted =
        await diarySync.handleEntriesMarkedForDeletion(entryIds);

      if (physicallyDeleted) {
        await diary.list.reconcileCurrentPage();
      }
    },
    [diary.list.reconcileCurrentPage, diarySync.handleEntriesMarkedForDeletion]
  );

  const selection = useOwnerDiarySelection({
    availableEntryIds,

    onEnter: diary.list.expandAllDays,

    onEntriesMarkedForDeletion: handleEntriesMarkedForDeletion,
  });

  useEffect(() => {
    toolbar.showToolbar();
  }, [selection.selectionMode, toolbar.showToolbar]);

  const handleOpenEntry = useCallback(
    async (entryId: string): Promise<void> => {
      if (transferLocked) {
        return;
      }

      try {
        const opened = await entryEditor.openEdit(entryId);

        if (opened) {
          return;
        }

        showNotification('error', t('diary.form.errors.openFailed'));
      } catch (error) {
        console.error(`Failed to open diary entry: ${entryId}`, error);

        showNotification('error', t('diary.form.errors.openFailed'));
      }
    },
    [entryEditor.openEdit, t, transferLocked]
  );

  const handleOpenPhoto = useCallback((entry: DiaryEntry) => {
    setPhotoViewerEntry(entry);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setPhotoViewerEntry(null);
  }, []);

  const handleManualSync = useCallback(async (): Promise<void> => {
    if (transferLocked) {
      return;
    }

    const synchronized = await diarySync.handleManualSync();

    if (synchronized) {
      await diary.list.reconcileCurrentPage();
    }
  }, [
    diary.list.reconcileCurrentPage,
    diarySync.handleManualSync,
    transferLocked,
  ]);

  const handleForcedSync = useCallback(async (): Promise<void> => {
    if (transferLocked) {
      return;
    }

    const entryIds = Array.from(selection.selectedEntryIds);

    if (entryIds.length === 0) {
      return;
    }

    selection.exitSelection();

    const synchronized = await diarySync.handleForcedSync(entryIds);

    if (synchronized) {
      await diary.list.reconcileCurrentPage();
    }
  }, [
    diary.list.reconcileCurrentPage,
    diarySync.handleForcedSync,
    selection.exitSelection,
    selection.selectedEntryIds,
    transferLocked,
  ]);

  useOwnerDiaryHeaderMenu({
    selectionMode: selection.selectionMode,

    connectionState: diarySync.connectionState,

    batchActive: diarySync.batchProgress !== null || transferLocked,

    manualSyncPending: diarySync.manualSyncPending,

    canEnterSelection: selection.canEnterSelection,

    currentPageDayKeys,

    collapsedDayKeys: diary.list.collapsedDayKeys,

    onManualSync: handleManualSync,

    onEnterSelection: selection.enterSelection,

    onCollapseAllDays: diary.list.collapseAllDays,

    onExpandAllDays: diary.list.expandAllDays,
  });

  return (
    <s.Root>
      <s.ListArea>
        <s.ListArea>
          <DiaryLocalList
            items={diary.list.listItems}
            page={diary.list.page}
            currentPage={diary.list.currentPage}
            collapsedDayKeys={diary.list.collapsedDayKeys}
            visibleEntryIds={diary.list.visibleEntryIds}
            selectedEntryIds={selection.selectedEntryIds}
            selectionActive={selection.selectionMode}
            dayToggleDisabled={selection.selectionMode}
            interactionDisabled={transferLocked}
            showPagination={!selection.selectionMode}
            isInitialLoading={diary.list.isInitialLoading}
            hasInitialError={diary.list.hasInitialError}
            isRefetching={diary.list.isRefetching}
            isPaginationLoading={diary.list.isPaginationLoading}
            isEntrySyncing={diarySync.isEntrySyncing}
            listRef={diary.list.listRef}
            viewabilityConfig={diary.list.viewabilityConfig}
            onViewableItemsChanged={diary.list.handleViewableItemsChanged}
            contentContainerStyle={toolbar.listContentContainerStyle}
            onScroll={toolbar.handleScroll}
            onScrollBeginDrag={toolbar.handleScrollBeginDrag}
            onScrollEndDrag={toolbar.handleScrollEndDrag}
            onToggleDay={diary.list.toggleDay}
            onToggleSelection={selection.toggleEntry}
            onOpenEntry={(entryId) => {
              void handleOpenEntry(entryId);
            }}
            onOpenPhoto={handleOpenPhoto}
            onChangePage={diary.list.handleChangePage}
            onRetry={diary.list.handleRetry}
          />
        </s.ListArea>

        <s.ToolbarOverlay
          onLayout={toolbar.handleToolbarLayout}
          style={toolbar.toolbarAnimatedStyle}
        >
          <s.ToolbarArea>
            {selection.selectionMode ? (
              <OwnerDiarySelectionToolbar
                selectedCount={selection.selectedCount}
                allSelected={selection.allSelected}
                deleting={selection.isDeleting}
                synchronizing={diarySync.forcedSyncPending}
                operationsDisabled={transferLocked}
                synchronizeDisabled={
                  selection.selectedCount === 0 ||
                  diarySync.connectionState !== 'online' ||
                  diarySync.batchProgress !== null ||
                  diarySync.forcedSyncPending ||
                  selection.isDeleting
                }
                onToggleAll={selection.toggleAll}
                onSynchronize={handleForcedSync}
                onDelete={selection.requestDelete}
                onClose={selection.exitSelection}
              />
            ) : (
              <DiarySearch
                text={diary.search.text}
                field={diary.search.search.field}
                onTextChange={diary.search.setText}
                onApplyText={diary.search.applyText}
                onFieldChange={diary.search.setField}
                onClear={diary.search.clear}
                filtersVisible={diary.filters.visible}
                filtersApplied={diary.filters.hasAppliedFilters}
                onOpenFilters={diary.filters.open}
                createDisabled={transferLocked}
                onCreateEntry={entryEditor.openCreate}
              />
            )}
          </s.ToolbarArea>

          {diarySync.batchProgress !== null && (
            <s.SyncProgress style={ss.Surface(theme, 'card')}>
              <Spinner size={18} />

              <s.SyncProgressText>
                {t('diary.sync.progress', {
                  current: diarySync.batchProgress.current,

                  total: diarySync.batchProgress.total,
                })}
              </s.SyncProgressText>
            </s.SyncProgress>
          )}
        </s.ToolbarOverlay>
      </s.ListArea>

      <CreateDiaryEntryModal
        visible={entryEditor.createVisible}
        disabled={transferLocked}
        onClose={entryEditor.closeCreate}
        onCreated={entryEditor.handleCreated}
      />

      <EditDiaryEntryModal
        visible={entryEditor.editVisible}
        entry={entryEditor.editingEntry}
        disabled={
          transferLocked ||
          (entryEditor.editingEntry !== null &&
            diarySync.isEntrySyncing(entryEditor.editingEntry.id))
        }
        onClose={entryEditor.closeEdit}
        onUpdated={entryEditor.handleUpdated}
      />

      <DiaryFiltersModal onApply={diary.filters.apply} />

      <DiaryPhotoViewer entry={photoViewerEntry} onClose={handleClosePhoto} />

      <ConfirmDialog
        visible={selection.deleteConfirmVisible}
        title={t('diary.selection.deleteConfirmTitle')}
        description={t('diary.selection.deleteConfirmDescription', {
          count: selection.selectedCount,
        })}
        confirmLabel={t('diary.selection.delete')}
        confirmTone="danger"
        confirmDisabled={selection.isDeleting || transferLocked}
        onConfirm={selection.confirmDelete}
        onClose={selection.closeDeleteConfirm}
      />

      <OwnerDiaryPreparationModal entry={diaryPreparation.preparingEntry} />

      <OwnerDiaryHelp menuEnabled={!selection.selectionMode} />
    </s.Root>
  );
};
