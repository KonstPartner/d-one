import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { showNotification } from '@features/shared/ui';

import {
  queueDiaryEntriesForSync,
  setDiaryEntryPreparing,
} from '../../api/diarySyncCoordinator';
import { useReadyDiaryDatabase } from '../../api/sqlite/DiaryDatabaseProvider';
import { useDiarySyncStore } from '../diarySyncStore';
import type { DiaryEntry, DiaryEntryFormMode } from '../types';

type DiaryEntryFormState = {
  visible: boolean;
  mode: DiaryEntryFormMode;
  entry: DiaryEntry | null;
};

const INITIAL_FORM_STATE: DiaryEntryFormState = {
  visible: false,
  mode: 'create',
  entry: null,
};

const useDiaryEntryFormController = () => {
  const { t } = useTranslation();
  const { userId, repository } = useReadyDiaryDatabase();

  const [formState, setFormState] =
    useState<DiaryEntryFormState>(INITIAL_FORM_STATE);
  const openRequestIdRef = useRef(0);

  const handleOpenCreateForm = useCallback(() => {
    openRequestIdRef.current += 1;

    setFormState({
      visible: true,
      mode: 'create',
      entry: null,
    });
  }, []);

  const handleOpenEditForm = useCallback(
    (entry: DiaryEntry) => {
      const requestId = openRequestIdRef.current + 1;

      openRequestIdRef.current = requestId;

      void repository
        .findById(entry.id)
        .then((currentEntry) => {
          if (requestId !== openRequestIdRef.current) {
            return;
          }

          if (
            currentEntry === null ||
            currentEntry.syncStatus === 'pendingDelete' ||
            useDiarySyncStore.getState().syncingEntryIds.has(entry.id)
          ) {
            showNotification('error', t('diary.form.errors.openFailed'));

            return;
          }

          setFormState({
            visible: true,
            mode: 'edit',
            entry: currentEntry,
          });
        })
        .catch(() => {
          if (requestId !== openRequestIdRef.current) {
            return;
          }

          showNotification('error', t('diary.form.errors.openFailed'));
        });
    },
    [repository, t]
  );

  const handleCloseForm = useCallback(() => {
    openRequestIdRef.current += 1;

    setFormState((currentState) => ({
      ...currentState,
      visible: false,
    }));
  }, []);

  const handleEntrySaved = useCallback(
    (entryId: string) => {
      setFormState((currentState) => ({
        ...currentState,
        visible: false,
      }));

      setDiaryEntryPreparing({
        userId,
        entryId,
        preparing: false,
      });

      void queueDiaryEntriesForSync({
        userId,
        entryIds: [entryId],
        repository,
      }).catch((error) => {
        console.error('Targeted diary synchronization failed', error);
      });
    },
    [repository, userId]
  );

  return {
    formState,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleEntrySaved,
  };
};

export default useDiaryEntryFormController;
