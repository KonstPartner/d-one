import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createDiaryPhotoDraft,
  type DiaryEntry,
  type DiaryPhotoDraft,
  DiaryPhotoError,
  type DiaryPhotoErrorCode,
  removeDiaryPhotoDraft,
} from '@entities/diary';
import { useImagePicker } from '@shared/lib/media';
import type { PhotoRedactorResult } from '@shared/ui';

type EditDiaryPhotoAction = 'keep' | 'replace' | 'delete';

type EditDiaryPhotoSource = 'camera' | 'library' | 'selected';

type PhotoEditorMode = 'new' | 'selected';

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

  const [photoEditorSource, setPhotoEditorSource] =
    useState<DiaryPhotoDraft | null>(null);

  const [photoError, setPhotoError] = useState<DiaryPhotoErrorCode | null>(
    null
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const photoDraftUriRef = useRef<string | null>(null);

  const photoEditorSourceRef = useRef<DiaryPhotoDraft | null>(null);

  const photoEditorModeRef = useRef<PhotoEditorMode | null>(null);

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

  const deleteDraftSilently = useCallback((draftUri: string | null): void => {
    if (draftUri === null) {
      return;
    }

    try {
      removeDiaryPhotoDraft(draftUri);
    } catch {
      return;
    }
  }, []);

  const clearEditorSource = useCallback((): void => {
    photoEditorSourceRef.current = null;

    photoEditorModeRef.current = null;

    setPhotoEditorSource(null);
  }, []);

  const resetPhotoState = useCallback(
    (removeDrafts: boolean): boolean => {
      operationIdRef.current += 1;

      const editorUri = photoEditorSourceRef.current?.uri ?? null;

      const draftUri = photoDraftUriRef.current;

      if (
        removeDrafts &&
        editorUri !== null &&
        editorUri !== draftUri &&
        !deleteDraft(editorUri)
      ) {
        return false;
      }

      clearEditorSource();

      if (removeDrafts && !deleteDraft(draftUri)) {
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
    [clearEditorSource, deleteDraft]
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

      const editorUri = photoEditorSourceRef.current?.uri ?? null;

      const draftUri = photoDraftUriRef.current;

      if (editorUri !== null && editorUri !== draftUri) {
        deleteDraftSilently(editorUri);
      }

      deleteDraftSilently(draftUri);
    },
    [deleteDraftSilently]
  );

  const existingPhotoUri = entry?.localPhotoUri ?? entry?.photoUrl ?? null;

  const photoUri =
    photoDraftUri ?? (photoAction === 'delete' ? null : existingPhotoUri);

  const selectPhoto = useCallback(
    async (source: EditDiaryPhotoSource): Promise<void> => {
      if (isBusyRef.current || photoEditorSourceRef.current !== null) {
        return;
      }

      if (source === 'selected' && photoUri === null) {
        return;
      }

      const operationId = operationIdRef.current + 1;

      let uncommittedDraftUri: string | null = null;

      operationIdRef.current = operationId;

      isBusyRef.current = true;

      setPhotoError(null);

      setIsProcessing(true);

      try {
        let sourceUri: string | null;

        let editorMode: PhotoEditorMode;

        if (source === 'selected') {
          sourceUri = photoUri;

          editorMode = 'selected';
        } else {
          sourceUri =
            source === 'camera' ? await takeImage() : await pickImage();

          editorMode = 'new';
        }

        if (sourceUri === null || operationId !== operationIdRef.current) {
          return;
        }

        const nextDraft = await createDiaryPhotoDraft(sourceUri);

        uncommittedDraftUri = nextDraft.uri;

        if (operationId !== operationIdRef.current) {
          return;
        }

        photoEditorSourceRef.current = nextDraft;

        photoEditorModeRef.current = editorMode;

        setPhotoEditorSource(nextDraft);

        uncommittedDraftUri = null;
      } catch (error) {
        if (operationId === operationIdRef.current) {
          setPhotoError(getPhotoErrorCode(error));
        }
      } finally {
        deleteDraftSilently(uncommittedDraftUri);

        if (operationId === operationIdRef.current) {
          isBusyRef.current = false;

          setIsProcessing(false);
        }
      }
    },
    [deleteDraftSilently, photoUri, pickImage, takeImage]
  );

  const cancelPhotoEditing = useCallback((): void => {
    if (isBusyRef.current) {
      return;
    }

    const editorSource = photoEditorSourceRef.current;

    if (editorSource === null) {
      return;
    }

    operationIdRef.current += 1;

    if (!deleteDraft(editorSource.uri)) {
      return;
    }

    clearEditorSource();
  }, [clearEditorSource, deleteDraft]);

  const confirmPhotoEditing = useCallback(
    async (result: PhotoRedactorResult): Promise<void> => {
      const editorSource = photoEditorSourceRef.current;

      const editorMode = photoEditorModeRef.current;

      if (editorSource === null || editorMode === null || isBusyRef.current) {
        return;
      }

      if (editorMode === 'selected' && !result.edited) {
        operationIdRef.current += 1;

        if (!deleteDraft(editorSource.uri)) {
          return;
        }

        clearEditorSource();

        return;
      }

      const operationId = operationIdRef.current + 1;

      let uncommittedDraftUri: string | null = null;

      operationIdRef.current = operationId;

      isBusyRef.current = true;

      setPhotoError(null);

      setIsProcessing(true);

      try {
        const nextDraft = result.edited
          ? await createDiaryPhotoDraft(result.uri)
          : editorSource;

        if (result.edited) {
          uncommittedDraftUri = nextDraft.uri;
        }

        if (operationId !== operationIdRef.current) {
          return;
        }

        const previousDraftUri = photoDraftUriRef.current;

        if (
          previousDraftUri !== null &&
          previousDraftUri !== nextDraft.uri &&
          !deleteDraft(previousDraftUri)
        ) {
          return;
        }

        photoDraftUriRef.current = nextDraft.uri;

        setPhotoDraftUri(nextDraft.uri);

        setPhotoAction('replace');

        clearEditorSource();

        uncommittedDraftUri = null;

        if (result.edited) {
          deleteDraftSilently(editorSource.uri);
        }
      } catch (error) {
        if (operationId === operationIdRef.current) {
          setPhotoError(getPhotoErrorCode(error));
        }
      } finally {
        deleteDraftSilently(uncommittedDraftUri);

        if (operationId === operationIdRef.current) {
          isBusyRef.current = false;

          setIsProcessing(false);
        }
      }
    },
    [clearEditorSource, deleteDraft, deleteDraftSilently]
  );

  const handlePhotoEditorError = useCallback((error: unknown): void => {
    setPhotoError(getPhotoErrorCode(error));
  }, []);

  const deletePhoto = useCallback((): void => {
    if (isBusyRef.current || photoEditorSourceRef.current !== null) {
      return;
    }

    if (!deleteDraft(photoDraftUriRef.current)) {
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

  const markPhotoSaved = useCallback((): void => {
    operationIdRef.current += 1;

    photoDraftUriRef.current = null;

    clearEditorSource();

    setPhotoDraftUri(null);

    setPhotoAction('keep');

    setPhotoError(null);

    setIsProcessing(false);

    isBusyRef.current = false;
  }, [clearEditorSource]);

  const clearPhotoError = useCallback((): void => {
    setPhotoError(null);
  }, []);

  return {
    photoUri,

    photoDraftUri,
    photoAction,
    photoEditorSource,
    photoError,

    hasPhoto: photoUri !== null,

    hasTemporaryPhoto: photoDraftUri !== null || photoEditorSource !== null,

    hasPhotoChanges: photoAction !== 'keep',

    isPhotoBusy: isPicking || isProcessing,

    selectPhoto,
    deletePhoto,

    cancelPhotoEditing,
    confirmPhotoEditing,
    handlePhotoEditorError,

    discardPhotoChanges,
    markPhotoSaved,
    clearPhotoError,
  };
};
