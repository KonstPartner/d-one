import { useCallback, useRef, useState } from 'react';

import { type DiaryEntry, useReadyDiaryDatabase } from '@entities/diary';

export type OwnerDiarySavedEntry = {
  entryId: string;

  operation: 'create' | 'update';

  entryUpdated: boolean;

  requestAi: boolean;
  requestTimer: boolean;

  deleteAiAnalysis: boolean;
};

type OwnerDiaryCreatedEntry = {
  entryId: string;

  requestAi: boolean;
  requestTimer: boolean;
};

type OwnerDiaryUpdatedEntry = {
  entryId: string;

  entryUpdated: boolean;

  requestAi: boolean;
  requestTimer: boolean;

  deleteAiAnalysis: boolean;
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
    async (savedEntry: OwnerDiarySavedEntry): Promise<void> => {
      try {
        await onEntrySaved(savedEntry);
      } catch (error) {
        console.error(
          `Failed to process saved diary entry: ${savedEntry.entryId}`,
          error
        );
      } finally {
        setCreateVisible(false);

        setEditingEntry(null);
      }
    },
    [onEntrySaved]
  );

  const handleCreated = useCallback(
    (result: OwnerDiaryCreatedEntry) => {
      void processSavedEntry({
        entryId: result.entryId,

        operation: 'create',

        entryUpdated: true,

        requestAi: result.requestAi,
        requestTimer: result.requestTimer,

        deleteAiAnalysis: false,
      });
    },
    [processSavedEntry]
  );

  const handleUpdated = useCallback(
    (result: OwnerDiaryUpdatedEntry) => {
      void processSavedEntry({
        entryId: result.entryId,

        operation: 'update',

        entryUpdated: result.entryUpdated,

        requestAi: result.requestAi,
        requestTimer: result.requestTimer,

        deleteAiAnalysis: result.deleteAiAnalysis,
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
