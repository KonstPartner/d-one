import { PhotoViewer } from '@shared/ui';

import type { DiaryEntry } from '../model/diaryEntry';
import { useDiaryEntryPhoto } from '../model/useDiaryEntryPhoto';

type DiaryPhotoViewerProps = {
  entry: DiaryEntry | null;

  onClose: () => void;
};

export const DiaryPhotoViewer = ({ entry, onClose }: DiaryPhotoViewerProps) => {
  const visible = entry !== null;

  const {
    sourceUri,
    sourceKey,
    sourceIsLocal,

    loading,

    cloudOnlyOffline,
    fallbackText,

    photoAccessibilityLabel,

    onLoadStart,
    onLoad,
    onError,
  } = useDiaryEntryPhoto({
    localPhotoUri: entry?.localPhotoUri ?? null,

    photoUrl: entry?.photoUrl ?? null,

    isVisible: visible,
  });

  return (
    <PhotoViewer
      visible={visible}
      sourceUri={sourceUri}
      sourceKey={sourceKey}
      sourceIsLocal={sourceIsLocal}
      recyclingKey={entry?.id ?? null}
      loading={loading}
      fallbackText={fallbackText}
      fallbackIcon={
        cloudOnlyOffline ? 'cloud-offline-outline' : 'image-outline'
      }
      accessibilityLabel={photoAccessibilityLabel}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      onError={onError}
      onClose={onClose}
    />
  );
};
