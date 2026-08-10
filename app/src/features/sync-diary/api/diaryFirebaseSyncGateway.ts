import type { DiaryEntry } from '@entities/diary';

type CloudPhotoState = Pick<DiaryEntry, 'photoPath' | 'photoUrl'>;

const createUnsupportedError = (): Error =>
  new Error('Diary synchronization is not supported on this platform');

export const deleteDiaryCloudPhoto = async (
  _photoPath: string
): Promise<void> => {
  throw createUnsupportedError();
};

export const uploadDiaryCloudPhoto = async ({
  localPhotoUri: _localPhotoUri,
  photoPath: _photoPath,
}: {
  localPhotoUri: string;
  photoPath: string;
}): Promise<string> => {
  throw createUnsupportedError();
};

export const upsertDiaryCloudEntry = async ({
  entry: _entry,
  photoState: _photoState,
}: {
  entry: DiaryEntry;
  photoState: CloudPhotoState;
}): Promise<void> => {
  throw createUnsupportedError();
};

export const deleteDiaryCloudEntry = async ({
  userId: _userId,
  entryId: _entryId,
}: {
  userId: string;
  entryId: string;
}): Promise<void> => {
  throw createUnsupportedError();
};
