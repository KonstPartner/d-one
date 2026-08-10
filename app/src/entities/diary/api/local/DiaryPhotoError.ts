export type DiaryPhotoErrorCode =
  | 'processingFailed'
  | 'invalidFile'
  | 'fileTooLarge'
  | 'storageFailed';

export class DiaryPhotoError extends Error {
  public constructor(public readonly code: DiaryPhotoErrorCode) {
    super(code);

    this.name = 'DiaryPhotoError';
  }
}
