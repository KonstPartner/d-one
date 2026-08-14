import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteDiaryEntriesMutation } from '@features/delete-diary-entries';
import { showNotification } from '@shared/lib/notifications';
import { useSelection } from '@shared/lib/selection';

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

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const selection = useSelection({
    availableIds: availableEntryIds,

    disabled: deleteMutation.isPending,
  });

  const canDelete = selection.selectedCount > 0 && !deleteMutation.isPending;

  const enterSelection = useCallback(() => {
    const entered = selection.enter();

    if (!entered) {
      return;
    }

    setDeleteConfirmVisible(false);

    onEnter();
  }, [onEnter, selection.enter]);

  const exitSelection = useCallback(() => {
    if (deleteMutation.isPending) {
      return;
    }

    setDeleteConfirmVisible(false);

    selection.exit();
  }, [deleteMutation.isPending, selection.exit]);

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

    const entryIds = selection.selectedIdsArray;

    try {
      const deletedEntryIds = await deleteMutation.mutateAsync(entryIds);

      setDeleteConfirmVisible(false);

      selection.forceExit();

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
    deleteMutation.mutateAsync,
    onEntriesMarkedForDeletion,
    selection.forceExit,
    selection.selectedIdsArray,
    t,
  ]);

  return {
    selectionMode: selection.selectionMode,

    selectedEntryIds: selection.selectedIds,

    selectedEntryIdsArray: selection.selectedIdsArray,

    selectedCount: selection.selectedCount,

    allSelected: selection.allSelected,

    deleteConfirmVisible,

    isDeleting: deleteMutation.isPending,

    canEnterSelection: selection.canEnter,

    canDelete,

    enterSelection,
    exitSelection,

    toggleEntry: selection.toggle,

    toggleAll: selection.toggleAll,

    isEntrySelected: selection.isSelected,

    requestDelete,

    closeDeleteConfirm,
    confirmDelete,
  };
};
