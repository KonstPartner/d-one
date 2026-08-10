import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteDiaryEntriesMutation } from '@features/delete-diary-entries';
import { showNotification } from '@shared/lib/notifications';

type UseOwnerDiarySelectionParams = {
  availableEntryIds: ReadonlySet<string>;

  onEnter: () => void;

  onEntriesMarkedForDeletion: (
    entryIds: ReadonlyArray<string>
  ) => void | Promise<void>;
};

export const useOwnerDiarySelection = ({
  availableEntryIds,
  onEnter,
  onEntriesMarkedForDeletion,
}: UseOwnerDiarySelectionParams) => {
  const { t } = useTranslation();

  const deleteMutation = useDeleteDiaryEntriesMutation();

  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedEntryIds, setSelectedEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    setSelectedEntryIds((currentIds) => {
      const nextIds = new Set(
        Array.from(currentIds).filter((entryId) =>
          availableEntryIds.has(entryId)
        )
      );

      if (nextIds.size === currentIds.size) {
        return currentIds;
      }

      return nextIds;
    });
  }, [availableEntryIds]);

  const selectedCount = selectedEntryIds.size;

  const allSelected =
    availableEntryIds.size > 0 && selectedCount === availableEntryIds.size;

  const canDelete = selectedCount > 0 && !deleteMutation.isPending;

  const enterSelection = useCallback(() => {
    if (availableEntryIds.size === 0 || deleteMutation.isPending) {
      return;
    }

    setSelectedEntryIds(new Set());

    setDeleteConfirmVisible(false);

    setSelectionMode(true);

    onEnter();
  }, [availableEntryIds.size, deleteMutation.isPending, onEnter]);

  const exitSelection = useCallback(() => {
    if (deleteMutation.isPending) {
      return;
    }

    setDeleteConfirmVisible(false);

    setSelectedEntryIds(new Set());

    setSelectionMode(false);
  }, [deleteMutation.isPending]);

  const toggleEntry = useCallback(
    (entryId: string) => {
      if (
        !selectionMode ||
        deleteMutation.isPending ||
        !availableEntryIds.has(entryId)
      ) {
        return;
      }

      setSelectedEntryIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(entryId)) {
          nextIds.delete(entryId);
        } else {
          nextIds.add(entryId);
        }

        return nextIds;
      });
    },
    [availableEntryIds, deleteMutation.isPending, selectionMode]
  );

  const toggleAll = useCallback(() => {
    if (!selectionMode || deleteMutation.isPending) {
      return;
    }

    setSelectedEntryIds(allSelected ? new Set() : new Set(availableEntryIds));
  }, [allSelected, availableEntryIds, deleteMutation.isPending, selectionMode]);

  const isEntrySelected = useCallback(
    (entryId: string): boolean => selectedEntryIds.has(entryId),
    [selectedEntryIds]
  );

  const requestDelete = useCallback(() => {
    if (!canDelete) {
      return;
    }

    setDeleteConfirmVisible(true);
  }, [canDelete]);

  const closeDeleteConfirm = useCallback(() => {
    if (deleteMutation.isPending) {
      return;
    }

    setDeleteConfirmVisible(false);
  }, [deleteMutation.isPending]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!canDelete) {
      return;
    }

    const entryIds = Array.from(selectedEntryIds);

    try {
      const deletedEntryIds = await deleteMutation.mutateAsync(entryIds);

      setDeleteConfirmVisible(false);

      setSelectedEntryIds(new Set());

      setSelectionMode(false);

      void Promise.resolve(onEntriesMarkedForDeletion(deletedEntryIds)).catch(
        (error) => {
          console.error(
            'Failed to process diary entries after local deletion',
            error
          );
        }
      );
    } catch (error) {
      console.error('Failed to delete diary entries', error);

      setDeleteConfirmVisible(false);

      showNotification('error', t('diary.selection.deleteFailed'));
    }
  }, [
    canDelete,
    deleteMutation,
    onEntriesMarkedForDeletion,
    selectedEntryIds,
    t,
  ]);

  const selectedEntryIdsArray = useMemo(
    () => Array.from(selectedEntryIds),
    [selectedEntryIds]
  );

  return {
    selectionMode,

    selectedEntryIds,
    selectedEntryIdsArray,

    selectedCount,

    allSelected,

    deleteConfirmVisible,

    isDeleting: deleteMutation.isPending,

    canEnterSelection: availableEntryIds.size > 0 && !deleteMutation.isPending,

    canDelete,

    enterSelection,
    exitSelection,

    toggleEntry,
    toggleAll,

    isEntrySelected,

    requestDelete,

    closeDeleteConfirm,
    confirmDelete,
  };
};
