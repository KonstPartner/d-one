import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  queueForcedDiaryEntriesForSync,
  useDeleteDiaryEntries,
  useReadyDiaryDatabase,
} from '@features/diary/api';
import { type DiaryEntry, useDiaryListStore } from '@features/diary/model';
import { showNotification } from '@shared/lib/notifications';

const haveSameIds = (
  currentIds: ReadonlySet<string>,
  nextIds: ReadonlySet<string>
): boolean => {
  if (currentIds.size !== nextIds.size) {
    return false;
  }

  for (const id of currentIds) {
    if (!nextIds.has(id)) {
      return false;
    }
  }

  return true;
};

export const useDiarySelection = (availableEntryIds: ReadonlySet<string>) => {
  const { t } = useTranslation();

  const expandAllDays = useDiaryListStore((state) => state.expandAllDays);

  const { userId, repository } = useReadyDiaryDatabase();

  const deleteEntries = useDeleteDiaryEntries();

  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);

  const allAvailableSelected =
    availableEntryIds.size > 0 &&
    Array.from(availableEntryIds).every((id) => selectedIds.has(id));

  const selectAllChecked: boolean | 'mixed' =
    selectedIds.size === 0 ? false : allAvailableSelected ? true : 'mixed';

  const handleExitSelection = useCallback(() => {
    setDeleteConfirmationVisible(false);
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  const handleEnterSelection = useCallback(() => {
    setSelectedIds(new Set());
    expandAllDays();
    setSelectionMode(true);
  }, [expandAllDays]);

  const handleToggleSelection = useCallback(
    (entry: DiaryEntry) => {
      if (!availableEntryIds.has(entry.id)) {
        return;
      }

      setSelectedIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(entry.id)) {
          nextIds.delete(entry.id);
        } else {
          nextIds.add(entry.id);
        }

        return nextIds;
      });
    },
    [availableEntryIds]
  );

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(
      allAvailableSelected ? new Set() : new Set(availableEntryIds)
    );
  }, [allAvailableSelected, availableEntryIds]);

  const handleOpenDeleteConfirmation = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }

    setDeleteConfirmationVisible(true);
  }, [selectedIds.size]);

  const handleCloseDeleteConfirmation = useCallback(() => {
    setDeleteConfirmationVisible(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedIds.size === 0 || deleteEntries.isPending) {
      return;
    }

    try {
      await deleteEntries.mutateAsync(Array.from(selectedIds));

      handleExitSelection();
    } catch (error) {
      console.error('Failed to mark diary entries for deletion', error);

      setDeleteConfirmationVisible(false);

      showNotification('error', t('diary.selection.deleteFailed'));
    }
  }, [deleteEntries, handleExitSelection, selectedIds, t]);

  const handleSynchronizeSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }

    const entryIds = Array.from(selectedIds);

    handleExitSelection();

    void queueForcedDiaryEntriesForSync({
      userId,
      entryIds,
      repository,
    }).catch((error) => {
      console.error('Forced diary synchronization failed', error);

      showNotification('error', t('diary.sync.failed'));
    });
  }, [handleExitSelection, repository, selectedIds, t, userId]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleExitSelection();

        return true;
      }
    );

    return () => subscription.remove();
  }, [handleExitSelection, selectionMode]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    setSelectedIds((currentIds) => {
      const nextIds = new Set(
        Array.from(currentIds).filter((id) => availableEntryIds.has(id))
      );

      return haveSameIds(currentIds, nextIds) ? currentIds : nextIds;
    });
  }, [availableEntryIds, selectionMode]);

  return {
    selectionMode,
    selectedIds,

    selectedCount: selectedIds.size,
    availableCount: availableEntryIds.size,

    allAvailableSelected,
    selectAllChecked,

    deletePending: deleteEntries.isPending,
    deleteConfirmationVisible,

    handleEnterSelection,
    handleExitSelection,
    handleToggleSelection,
    handleToggleSelectAll,

    handleOpenDeleteConfirmation,
    handleCloseDeleteConfirmation,
    handleConfirmDelete,

    handleSynchronizeSelected,
  };
};
