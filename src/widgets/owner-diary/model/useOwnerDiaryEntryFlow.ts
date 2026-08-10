import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiaryEntryEditor } from './useOwnerDiaryEntryEditor';
import { useOwnerDiarySync } from './useOwnerDiarySync';

export const useOwnerDiaryEntryFlow = () => {
  const { t } = useTranslation();

  const sync = useOwnerDiarySync();

  const editor = useOwnerDiaryEntryEditor({
    onEntrySaved: sync.handleEntrySaved,
  });

  const handleOpenCreate = useCallback(() => {
    if (sync.isPreparingSavedEntry) {
      return;
    }

    editor.openCreate();
  }, [editor.openCreate, sync.isPreparingSavedEntry]);

  const handleOpenEdit = useCallback(
    async (entryId: string): Promise<void> => {
      if (sync.isPreparingSavedEntry || sync.isEntrySyncing(entryId)) {
        return;
      }

      try {
        const opened = await editor.openEdit(entryId);

        if (opened) {
          return;
        }

        showNotification('error', t('diary.form.errors.openFailed'));
      } catch (error) {
        console.error(
          `Failed to open diary entry for editing: ${entryId}`,
          error
        );

        showNotification('error', t('diary.form.errors.openFailed'));
      }
    },
    [editor.openEdit, sync.isEntrySyncing, sync.isPreparingSavedEntry, t]
  );

  const editingEntryId = editor.editingEntry?.id ?? null;

  const isEditingEntrySyncing =
    editingEntryId !== null && sync.isEntrySyncing(editingEntryId);

  return {
    createVisible: editor.createVisible,

    editVisible: editor.editVisible,

    editingEntry: editor.editingEntry,

    isOpeningEdit: editor.isOpeningEdit,

    preparingSavedEntry: sync.preparingSavedEntry,

    isPreparingSavedEntry: sync.isPreparingSavedEntry,

    isEditingEntrySyncing,

    connectionState: sync.connectionState,

    batchProgress: sync.batchProgress,

    batchType: sync.batchType,

    syncingEntryIds: sync.syncingEntryIds,

    openCreate: handleOpenCreate,

    closeCreate: editor.closeCreate,

    openEdit: handleOpenEdit,

    closeEdit: editor.closeEdit,

    handleCreated: editor.handleCreated,

    handleUpdated: editor.handleUpdated,

    handleManualSync: sync.handleManualSync,

    isEntrySyncing: sync.isEntrySyncing,
  };
};
