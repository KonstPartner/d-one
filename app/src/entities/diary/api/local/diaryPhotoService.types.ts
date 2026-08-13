export type DiaryPhotoDraft = {
  uri: string;
  width: number;
  height: number;
  size: number;
};

export type PreparedDiaryPhoto = {
  localPhotoUri: string;
  photoPath: string;

  finalize: () => void;
  rollback: () => void;
};

export type PreparedDiaryPhotoRemoval = {
  finalize: () => void;
  rollback: () => void;
};
