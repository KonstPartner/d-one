import { DiaryPhotoError } from './DiaryPhotoError';
import {
  type DiaryPhotoDraft,
  type PreparedDiaryPhoto,
  type PreparedDiaryPhotoRemoval,
} from './diaryPhotoService.types';

const createUnsupportedError = (): DiaryPhotoError =>
  new DiaryPhotoError('storageFailed');

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
