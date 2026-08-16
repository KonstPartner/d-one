import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createDiaryPhotoDraft,
  type DiaryPhotoDraft,
  DiaryPhotoError,
  type DiaryPhotoErrorCode,
  removeDiaryPhotoDraft,
} from '@entities/diary';
import { useImagePicker } from '@shared/lib/media';
import type { PhotoRedactorResult } from '@shared/ui';

export type CreateDiaryPhotoSource = 'camera' | 'library';

type UseCreateDiaryEntryPhotoParams = {
  visible: boolean;
};

const getPhotoErrorCode = (error: unknown): DiaryPhotoErrorCode =>
  error instanceof DiaryPhotoError ? error.code : 'processingFailed';

export const useCreateDiaryEntryPhoto = ({
  visible,
}: UseCreateDiaryEntryPhotoParams) => {
  const { pickImage, takeImage, isPicking } = useImagePicker();

  const [photoDraftUri, setPhotoDraftUri] = useState<string | null>(null);

  const [photoEditorSource, setPhotoEditorSource] =
    useState<DiaryPhotoDraft | null>(null);

  const [photoError, setPhotoError] = useState<DiaryPhotoErrorCode | null>(
    null
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const photoDraftUriRef = useRef<string | null>(null);

  const photoEditorSourceRef = useRef<DiaryPhotoDraft | null>(null);

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

    setPhotoEditorSource(null);
  }, []);

  const resetPhotoState = useCallback(
    (removeDrafts: boolean): boolean => {
      operationIdRef.current += 1;

      if (removeDrafts && photoEditorSourceRef.current !== null) {
        if (!deleteDraft(photoEditorSourceRef.current.uri)) {
          return false;
        }
      }

      clearEditorSource();

      if (removeDrafts && !deleteDraft(photoDraftUriRef.current)) {
        return false;
      }

      photoDraftUriRef.current = null;

      setPhotoDraftUri(null);

      setPhotoError(null);

      setIsProcessing(false);

      isBusyRef.current = false;

      return true;
    },
    [clearEditorSource, deleteDraft]
  );

  useEffect(() => {
    if (!visible) {
      resetPhotoState(true);
    }
  }, [resetPhotoState, visible]);

  useEffect(
    () => () => {
      operationIdRef.current += 1;

      deleteDraftSilently(photoEditorSourceRef.current?.uri ?? null);

      deleteDraftSilently(photoDraftUriRef.current);
    },
    [deleteDraftSilently]
  );

  const selectPhoto = useCallback(
    async (source: CreateDiaryPhotoSource): Promise<void> => {
      if (isBusyRef.current || photoEditorSourceRef.current !== null) {
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

        photoEditorSourceRef.current = nextDraft;

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
    [deleteDraftSilently, pickImage, takeImage]
  );

  const cancelPhotoEditing = useCallback((): void => {
    if (isBusyRef.current) {
      return;
    }

    const source = photoEditorSourceRef.current;

    if (source === null) {
      return;
    }

    operationIdRef.current += 1;

    if (!deleteDraft(source.uri)) {
      return;
    }

    clearEditorSource();
  }, [clearEditorSource, deleteDraft]);

  const confirmPhotoEditing = useCallback(
    async (result: PhotoRedactorResult): Promise<void> => {
      const editorSource = photoEditorSourceRef.current;

      if (editorSource === null || isBusyRef.current) {
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

        clearEditorSource();

        if (result.edited) {
          deleteDraftSilently(editorSource.uri);

          uncommittedDraftUri = null;
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

  const deletePhoto = useCallback(() => {
    if (isBusyRef.current || !deleteDraft(photoDraftUriRef.current)) {
      return;
    }

    operationIdRef.current += 1;

    photoDraftUriRef.current = null;

    setPhotoDraftUri(null);

    setPhotoError(null);
  }, [deleteDraft]);

  const discardPhoto = useCallback(
    (): boolean => resetPhotoState(true),
    [resetPhotoState]
  );

  const markPhotoSaved = useCallback(() => {
    operationIdRef.current += 1;

    photoDraftUriRef.current = null;

    setPhotoError(null);

    setIsProcessing(false);

    isBusyRef.current = false;
  }, []);

  const clearPhotoError = useCallback(() => {
    setPhotoError(null);
  }, []);

  return {
    photoUri: photoDraftUri,

    photoDraftUri,
    photoEditorSource,
    photoError,

    hasPhoto: photoDraftUri !== null,

    hasTemporaryPhoto: photoDraftUri !== null || photoEditorSource !== null,

    isPhotoBusy: isPicking || isProcessing,

    selectPhoto,
    deletePhoto,

    cancelPhotoEditing,
    confirmPhotoEditing,
    handlePhotoEditorError,

    discardPhoto,
    markPhotoSaved,
    clearPhotoError,
  };
};
