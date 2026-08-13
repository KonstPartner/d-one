import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createDiaryPhotoDraft,
  type DiaryEntry,
  DiaryPhotoError,
  type DiaryPhotoErrorCode,
  removeDiaryPhotoDraft,
} from '@entities/diary';
import { useImagePicker } from '@shared/lib/media';

type EditDiaryPhotoAction = 'keep' | 'replace' | 'delete';

type EditDiaryPhotoSource = 'camera' | 'library';

type UseEditDiaryEntryPhotoParams = {
  visible: boolean;
  entry: DiaryEntry | null;
};

const getPhotoErrorCode = (error: unknown): DiaryPhotoErrorCode =>
  error instanceof DiaryPhotoError ? error.code : 'processingFailed';

export const useEditDiaryEntryPhoto = ({
  visible,
  entry,
}: UseEditDiaryEntryPhotoParams) => {
  const { pickImage, takeImage, isPicking } = useImagePicker();

  const [photoDraftUri, setPhotoDraftUri] = useState<string | null>(null);

  const [photoAction, setPhotoAction] = useState<EditDiaryPhotoAction>('keep');

  const [photoError, setPhotoError] = useState<DiaryPhotoErrorCode | null>(
    null
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const photoDraftUriRef = useRef<string | null>(null);

  const activeEntryIdRef = useRef<string | null>(null);

  const operationIdRef = useRef(0);

  const isBusyRef = useRef(false);

  const deleteDraft = useCallback((draftUri: string | null): boolean => {
    if (draftUri === null) {
      return true;
    }

    try {
      removeDiaryPhotoDraft(draftUri);

      return true;
    } catch (error) {
      setPhotoError(getPhotoErrorCode(error));

      return false;
    }
  }, []);

  const deleteUncommittedDraft = useCallback((draftUri: string | null) => {
    if (draftUri === null) {
      return;
    }

    try {
      removeDiaryPhotoDraft(draftUri);
    } catch {
      return;
    }
  }, []);

  const resetPhotoState = useCallback(
    (removeDraft: boolean): boolean => {
      operationIdRef.current += 1;

      if (removeDraft && !deleteDraft(photoDraftUriRef.current)) {
        return false;
      }

      photoDraftUriRef.current = null;

      setPhotoDraftUri(null);

      setPhotoAction('keep');

      setPhotoError(null);

      setIsProcessing(false);

      isBusyRef.current = false;

      return true;
    },
    [deleteDraft]
  );

  useEffect(() => {
    if (!visible) {
      activeEntryIdRef.current = null;

      resetPhotoState(true);

      return;
    }

    const entryId = entry?.id ?? null;

    if (activeEntryIdRef.current === entryId) {
      return;
    }

    activeEntryIdRef.current = entryId;

    resetPhotoState(true);
  }, [entry?.id, resetPhotoState, visible]);

  useEffect(
    () => () => {
      operationIdRef.current += 1;

      const draftUri = photoDraftUriRef.current;

      if (draftUri === null) {
        return;
      }

      try {
        removeDiaryPhotoDraft(draftUri);
      } catch {
        return;
      }
    },
    []
  );

  const selectPhoto = useCallback(
    async (source: EditDiaryPhotoSource): Promise<void> => {
      if (isBusyRef.current) {
        return;
      }

      const operationId = operationIdRef.current + 1;

      let uncommittedDraftUri: string | null = null;

      operationIdRef.current = operationId;

      isBusyRef.current = true;

      setPhotoError(null);

      setIsProcessing(true);

      try {
        const sourceUri =
          source === 'camera' ? await takeImage() : await pickImage();

        if (sourceUri === null || operationId !== operationIdRef.current) {
          return;
        }

        const nextDraft = await createDiaryPhotoDraft(sourceUri);

        uncommittedDraftUri = nextDraft.uri;

        if (operationId !== operationIdRef.current) {
          return;
        }

        if (!deleteDraft(photoDraftUriRef.current)) {
          return;
        }

        photoDraftUriRef.current = nextDraft.uri;

        setPhotoDraftUri(nextDraft.uri);

        setPhotoAction('replace');

        setPhotoError(null);

        uncommittedDraftUri = null;
      } catch (error) {
        if (operationId === operationIdRef.current) {
          setPhotoError(getPhotoErrorCode(error));
        }
      } finally {
        deleteUncommittedDraft(uncommittedDraftUri);

        if (operationId === operationIdRef.current) {
          isBusyRef.current = false;

          setIsProcessing(false);
        }
      }
    },
    [deleteDraft, deleteUncommittedDraft, pickImage, takeImage]
  );

  const deletePhoto = useCallback(() => {
    if (isBusyRef.current || !deleteDraft(photoDraftUriRef.current)) {
      return;
    }

    operationIdRef.current += 1;

    photoDraftUriRef.current = null;

    setPhotoDraftUri(null);

    setPhotoAction('delete');

    setPhotoError(null);
  }, [deleteDraft]);

  const discardPhotoChanges = useCallback(
    (): boolean => resetPhotoState(true),
    [resetPhotoState]
  );

  const markPhotoSaved = useCallback(() => {
    operationIdRef.current += 1;

    photoDraftUriRef.current = null;

    setPhotoDraftUri(null);

    setPhotoAction('keep');

    setPhotoError(null);

    setIsProcessing(false);

    isBusyRef.current = false;
  }, []);

  const clearPhotoError = useCallback(() => {
    setPhotoError(null);
  }, []);

  const existingPhotoUri = entry?.localPhotoUri ?? entry?.photoUrl ?? null;

  const photoUri =
    photoDraftUri ?? (photoAction === 'delete' ? null : existingPhotoUri);

  return {
    photoUri,
    photoDraftUri,
    photoAction,
    photoError,

    hasPhoto: photoUri !== null,

    hasTemporaryPhoto: photoDraftUri !== null,

    hasPhotoChanges: photoAction !== 'keep',

    isPhotoBusy: isPicking || isProcessing,

    selectPhoto,
    deletePhoto,

    discardPhotoChanges,
    markPhotoSaved,
    clearPhotoError,
  };
};
