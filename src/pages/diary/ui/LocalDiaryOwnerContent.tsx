import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { type HeaderMenuItem, useHeaderMenu } from '@widgets/header-menu';
import {
  queuePendingDiaryEntriesForSync,
  useDiaryPage,
  useReadyDiaryDatabase,
} from '@features/diary/api';
import {
  areDiaryFilterControlsEqual,
  createDefaultDiaryFilters,
  type DiaryEntry,
  getDiaryDayKey,
  useDiaryListStore,
  useDiarySyncStore,
} from '@features/diary/model';
import { useDiaryEntryFormController } from '@features/diary/model/hooks';
import {
  DiaryEntryCard,
  DiaryEntryForm,
  DiaryFiltersModal,
  DiaryPhotoViewer,
  DiarySearchBar,
  LocalDiaryContent,
} from '@features/diary/ui';
import { showNotification } from '@shared/lib/notifications';

import { useDiarySelection } from '../model/useDiarySelection';
import * as s from '../styles/Diary';

import { DiarySelectionControls } from './DiarySelectionControls';

export const LocalDiaryOwnerContent = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const currentPage = useDiaryListStore((state) => state.currentPage);

  const appliedFilters = useDiaryListStore((state) => state.appliedFilters);

  const filterModalVisible = useDiaryListStore(
    (state) => state.filterModalVisible
  );

  const collapsedDayKeys = useDiaryListStore((state) => state.collapsedDayKeys);

  const collapseAllDays = useDiaryListStore((state) => state.collapseAllDays);

  const expandAllDays = useDiaryListStore((state) => state.expandAllDays);

  const openFilterModal = useDiaryListStore((state) => state.openFilterModal);

  const syncingEntryIds = useDiarySyncStore((state) => state.syncingEntryIds);

  const batchProgress = useDiarySyncStore((state) => state.batchProgress);

  const { userId, repository } = useReadyDiaryDatabase();

  const pageQuery = useDiaryPage(currentPage, appliedFilters);

  const [openedPhotoEntry, setOpenedPhotoEntry] = useState<DiaryEntry | null>(
    null
  );

  const [manualSyncPending, setManualSyncPending] = useState(false);

  const {
    formState,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleEntrySaved,
  } = useDiaryEntryFormController();

  const availableEntries = useMemo(
    () =>
      (pageQuery.data?.items ?? []).filter(
        (entry) =>
          entry.syncStatus !== 'pendingDelete' && !syncingEntryIds.has(entry.id)
      ),
    [pageQuery.data?.items, syncingEntryIds]
  );

  const availableEntryIds = useMemo(
    () => new Set(availableEntries.map((entry) => entry.id)),
    [availableEntries]
  );

  const {
    selectionMode,
    selectedIds,

    selectedCount,
    availableCount,

    allAvailableSelected,
    selectAllChecked,

    deletePending,
    deleteConfirmationVisible,

    handleEnterSelection: enterSelection,
    handleExitSelection,
    handleToggleSelection,
    handleToggleSelectAll,

    handleOpenDeleteConfirmation,
    handleCloseDeleteConfirmation,
    handleConfirmDelete,

    handleSynchronizeSelected,
  } = useDiarySelection(availableEntryIds);

  const currentPageDayKeys = useMemo(
    () =>
      Array.from(
        new Set(
          (pageQuery.data?.items ?? []).map((entry) =>
            getDiaryDayKey(entry.eventAt)
          )
        )
      ),
    [pageQuery.data?.items]
  );

  const allCurrentPageDaysCollapsed =
    currentPageDayKeys.length > 0 &&
    currentPageDayKeys.every((dayKey) => collapsedDayKeys.has(dayKey));

  const filtersApplied = useMemo(
    () =>
      !areDiaryFilterControlsEqual(appliedFilters, createDefaultDiaryFilters()),
    [appliedFilters]
  );

  const handleOpenPhoto = useCallback((entry: DiaryEntry) => {
    setOpenedPhotoEntry(entry);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setOpenedPhotoEntry(null);
  }, []);

  const handleEnterSelection = useCallback(() => {
    setOpenedPhotoEntry(null);
    enterSelection();
  }, [enterSelection]);

  const handleManualSync = useCallback(async () => {
    if (manualSyncPending || batchProgress !== null) {
      return;
    }

    setManualSyncPending(true);

    try {
      await queuePendingDiaryEntriesForSync({
        userId,
        repository,
        batchType: 'manual',
      });
    } catch (error) {
      console.error('Manual diary synchronization failed', error);

      showNotification('error', t('diary.sync.failed'));
    } finally {
      setManualSyncPending(false);
    }
  }, [batchProgress, manualSyncPending, repository, t, userId]);

  const handleCollapseAllDays = useCallback(() => {
    if (currentPageDayKeys.length === 0) {
      return;
    }

    collapseAllDays(currentPageDayKeys);
  }, [collapseAllDays, currentPageDayKeys]);

  const handleExpandAllDays = useCallback(() => {
    if (currentPageDayKeys.length === 0) {
      return;
    }

    expandAllDays();
  }, [currentPageDayKeys.length, expandAllDays]);

  const headerMenuItems = useMemo<HeaderMenuItem[]>(() => {
    if (selectionMode) {
      return [];
    }

    const items: HeaderMenuItem[] = [
      {
        key: 'diary-synchronize',
        labelKey: 'diary.menu.synchronize',
        icon: 'sync-outline',
        onPress: () => {
          void handleManualSync();
        },
        disabled: manualSyncPending || batchProgress !== null,
      },
      {
        key: 'diary-select-entries',
        labelKey: 'diary.menu.selectEntries',
        icon: 'checkbox-outline',
        onPress: handleEnterSelection,
        disabled: availableEntryIds.size === 0,
      },
    ];

    if (currentPageDayKeys.length > 0) {
      if (allCurrentPageDaysCollapsed) {
        items.push({
          key: 'diary-expand-all-days',
          labelKey: 'diary.menu.expandAllDays',
          icon: 'expand-outline',
          onPress: handleExpandAllDays,
        });
      } else {
        items.push({
          key: 'diary-collapse-all-days',
          labelKey: 'diary.menu.collapseAllDays',
          icon: 'contract-outline',
          onPress: handleCollapseAllDays,
        });
      }
    }

    return items;
  }, [
    allCurrentPageDaysCollapsed,
    availableEntryIds.size,
    batchProgress,
    currentPageDayKeys.length,
    handleCollapseAllDays,
    handleEnterSelection,
    handleExpandAllDays,
    handleManualSync,
    manualSyncPending,
    selectionMode,
  ]);

  useHeaderMenu(headerMenuItems, [headerMenuItems]);

  const renderLocalEntry = useCallback(
    (entry: DiaryEntry, isVisible: boolean) => {
      if (!selectionMode) {
        return (
          <DiaryEntryCard
            entry={entry}
            isVisible={isVisible}
            synchronizing={syncingEntryIds.has(entry.id)}
            onPress={handleOpenEditForm}
            onOpenPhoto={handleOpenPhoto}
          />
        );
      }

      const synchronizing = syncingEntryIds.has(entry.id);

      const unavailable = !availableEntryIds.has(entry.id);

      const selected = selectedIds.has(entry.id);

      return (
        <Pressable
          disabled={unavailable}
          accessibilityRole="checkbox"
          accessibilityLabel={t('diary.selection.entryAccessibilityLabel')}
          accessibilityState={{
            checked: selected,
            disabled: unavailable,
          }}
          onPress={() => handleToggleSelection(entry)}
          style={s.SelectableEntry(theme, selected, unavailable)}
        >
          <View style={s.SelectionIndicatorSlot}>
            {!unavailable && (
              <View style={s.SelectionIndicator(theme, selected)}>
                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={theme.size.md}
                    color={theme.colors.white}
                  />
                )}
              </View>
            )}
          </View>

          <View pointerEvents="none" style={s.SelectionCard(theme, selected)}>
            <DiaryEntryCard
              entry={entry}
              isVisible={isVisible}
              synchronizing={synchronizing}
            />
          </View>
        </Pressable>
      );
    },
    [
      availableEntryIds,
      handleOpenEditForm,
      handleOpenPhoto,
      handleToggleSelection,
      selectedIds,
      selectionMode,
      syncingEntryIds,
      t,
      theme,
    ]
  );

  return (
    <View style={s.OwnerContent}>
      {batchProgress !== null && (
        <View style={s.SyncProgress(theme)}>
          <ActivityIndicator size="small" color={theme.colors.primary} />

          <Text style={s.SyncProgressText(theme)}>
            {t('diary.sync.progress', {
              current: batchProgress.current,
              total: batchProgress.total,
            })}
          </Text>
        </View>
      )}

      {selectionMode ? (
        <DiarySelectionControls
          availableCount={availableCount}
          selectedCount={selectedCount}
          allAvailableSelected={allAvailableSelected}
          selectAllChecked={selectAllChecked}
          deletePending={deletePending}
          deleteConfirmationVisible={deleteConfirmationVisible}
          onToggleSelectAll={handleToggleSelectAll}
          onSynchronize={handleSynchronizeSelected}
          onRequestDelete={handleOpenDeleteConfirmation}
          onClose={handleExitSelection}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteConfirmation={handleCloseDeleteConfirmation}
        />
      ) : (
        <View style={s.Toolbar(theme)}>
          <DiarySearchBar
            filterModalVisible={filterModalVisible}
            filtersApplied={filtersApplied}
            onOpenFilters={openFilterModal}
            onCreateEntry={handleOpenCreateForm}
          />
        </View>
      )}

      <LocalDiaryContent
        selectionMode={selectionMode}
        renderEntry={renderLocalEntry}
      />

      <DiaryFiltersModal />

      <DiaryPhotoViewer entry={openedPhotoEntry} onClose={handleClosePhoto} />

      <DiaryEntryForm
        visible={formState.visible}
        mode={formState.mode}
        entry={formState.entry}
        onClose={handleCloseForm}
        onSaved={handleEntrySaved}
      />
    </View>
  );
};
