import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import useImagePicker from '@features/shared/model/hooks/useImagePicker';

import {
  createDiaryPhotoDraft,
  DiaryPhotoError,
  type DiaryPhotoErrorCode,
  removeDiaryPhotoDraft,
} from '../../api/diaryPhotoService';
import type { DiaryEntry, DiaryEntryFormMode } from '../types';

type UseDiaryEntryFormPhotoParams = {
  visible: boolean;
  mode: DiaryEntryFormMode;
  entry: DiaryEntry | null;
};

export type DiaryEntryFormPhotoAction = 'keep' | 'replace' | 'delete';
type DiaryPhotoSource = 'camera' | 'library';

const getPhotoErrorCode = (error: unknown): DiaryPhotoErrorCode =>
  error instanceof DiaryPhotoError ? error.code : 'processingFailed';

const useDiaryEntryFormPhoto = ({
  visible,
  mode,
  entry,
}: UseDiaryEntryFormPhotoParams) => {
  const { t } = useTranslation();
  const { pickImage, takeImage, isPicking } = useImagePicker();

  const [photoDraftUri, setPhotoDraftUri] = useState<string | null>(null);
  const [photoAction, setPhotoAction] =
    useState<DiaryEntryFormPhotoAction>('keep');
  const [photoError, setPhotoError] = useState<DiaryPhotoErrorCode | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const photoDraftUriRef = useRef<string | null>(null);
  const formKeyRef = useRef<string | null>(null);
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
      if (formKeyRef.current !== null) {
        formKeyRef.current = null;
        resetPhotoState(true);
      }

      return;
    }

    const formKey = mode === 'create' ? 'create' : `edit:${entry?.id ?? ''}`;

    if (formKeyRef.current === formKey) {
      return;
    }

    formKeyRef.current = formKey;
    resetPhotoState(true);
  }, [entry?.id, mode, resetPhotoState, visible]);

  useEffect(
    () => () => {
      operationIdRef.current += 1;

      if (photoDraftUriRef.current !== null) {
        try {
          removeDiaryPhotoDraft(photoDraftUriRef.current);
        } catch {
          return;
        }
      }
    },
    []
  );

  const selectPhoto = useCallback(
    async (source: DiaryPhotoSource): Promise<void> => {
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

  const handleChoosePhoto = useCallback(() => {
    if (isBusyRef.current) {
      return;
    }

    Alert.alert(
      t('diary.form.photo.sourceTitle'),
      t('diary.form.photo.sourceMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('diary.form.photo.camera'),
          onPress: () => {
            void selectPhoto('camera');
          },
        },
        {
          text: t('diary.form.photo.gallery'),
          onPress: () => {
            void selectPhoto('library');
          },
        },
      ]
    );
  }, [selectPhoto, t]);

  const handleDeletePhoto = useCallback(() => {
    if (isBusyRef.current || !deleteDraft(photoDraftUriRef.current)) {
      return;
    }

    operationIdRef.current += 1;
    photoDraftUriRef.current = null;
    setPhotoDraftUri(null);
    setPhotoAction(mode === 'edit' ? 'delete' : 'keep');
    setPhotoError(null);
  }, [deleteDraft, mode]);

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
    isPhotoBusy: isPicking || isProcessing,
    handleChoosePhoto,
    handleDeletePhoto,
    discardPhotoChanges,
    markPhotoSaved,
    clearPhotoError,
  };
};

export default useDiaryEntryFormPhoto;
