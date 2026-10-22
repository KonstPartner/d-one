import { CodedError } from '@shared/lib/errors';

import {
  type DiaryPhotoDraft,
  type DiaryPhotoErrorCode,
  type PreparedDiaryPhoto,
  type PreparedDiaryPhotoRemoval,
} from './diaryPhotoService.types';

const createUnsupportedError = (): CodedError<DiaryPhotoErrorCode> =>
  new CodedError('storageFailed');

export const createDiaryPhotoDraft = (
  _sourceUri: string
): Promise<DiaryPhotoDraft> => Promise.reject(createUnsupportedError());

export const removeDiaryPhotoDraft = (draftUri: string | null): void => {
  if (draftUri !== null) {
    throw createUnsupportedError();
  }
};

export const prepareDiaryPhotoForEntry = (_params: {
  userId: string;
  entryId: string;
  draftUri: string;
}): PreparedDiaryPhoto => {
  throw createUnsupportedError();
};

export const prepareDiaryPhotoRemoval = (_params: {
  userId: string;
  entryId: string;
}): PreparedDiaryPhotoRemoval => {
  throw createUnsupportedError();
};
