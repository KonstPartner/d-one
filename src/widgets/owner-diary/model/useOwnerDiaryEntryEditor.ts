import { useCallback, useRef, useState } from 'react';

import { type DiaryEntry, useReadyDiaryDatabase } from '@entities/diary';

export type OwnerDiarySavedEntry = {
  entryId: string;

  operation: 'create' | 'update';
};

type UseOwnerDiaryEntryEditorParams = {
  onEntrySaved: (entry: OwnerDiarySavedEntry) => void | Promise<void>;
};

export const useOwnerDiaryEntryEditor = ({
  onEntrySaved,
}: UseOwnerDiaryEntryEditorParams) => {
  const { repository } = useReadyDiaryDatabase();

  const [createVisible, setCreateVisible] = useState(false);

  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const [isOpeningEdit, setIsOpeningEdit] = useState(false);

  const openEditRequestIdRef = useRef(0);

  const openCreate = useCallback(() => {
    openEditRequestIdRef.current += 1;

    setEditingEntry(null);

    setCreateVisible(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateVisible(false);
  }, []);

  const openEdit = useCallback(
    async (entryId: string): Promise<boolean> => {
      const requestId = openEditRequestIdRef.current + 1;

      openEditRequestIdRef.current = requestId;

      setCreateVisible(false);

      setIsOpeningEdit(true);

      try {
        const entry = await repository.findById(entryId);

        if (requestId !== openEditRequestIdRef.current) {
          return false;
        }

        if (entry === null) {
          return false;
        }

        setEditingEntry(entry);

        return true;
      } finally {
        if (requestId === openEditRequestIdRef.current) {
          setIsOpeningEdit(false);
        }
      }
    },
    [repository]
  );

  const closeEdit = useCallback(() => {
    openEditRequestIdRef.current += 1;

    setIsOpeningEdit(false);

    setEditingEntry(null);
  }, []);

  const processSavedEntry = useCallback(
    (savedEntry: OwnerDiarySavedEntry) => {
      setCreateVisible(false);

      setEditingEntry(null);

      void Promise.resolve(onEntrySaved(savedEntry)).catch((error) => {
        console.error(
          `Failed to process saved diary entry: ${savedEntry.entryId}`,
          error
        );
      });
    },
    [onEntrySaved]
  );

  const handleCreated = useCallback(
    (entryId: string) => {
      processSavedEntry({
        entryId,
        operation: 'create',
      });
    },
    [processSavedEntry]
  );

  const handleUpdated = useCallback(
    (entryId: string) => {
      processSavedEntry({
        entryId,
        operation: 'update',
      });
    },
    [processSavedEntry]
  );

  return {
    createVisible,

    editingEntry,

    editVisible: editingEntry !== null,

    isOpeningEdit,

    openCreate,
    closeCreate,

    openEdit,
    closeEdit,

    handleCreated,
    handleUpdated,
  };
};
