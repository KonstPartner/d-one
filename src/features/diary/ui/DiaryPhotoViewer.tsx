import { PhotoViewer } from '@features/shared/ui';

import useDiaryEntryPhoto from '../model/hooks/useDiaryEntryPhoto';
import type { DiaryEntry } from '../model/types';

type DiaryPhotoViewerProps = {
  entry: DiaryEntry | null;
  onClose: () => void;
};

const DiaryPhotoViewer = ({ entry, onClose }: DiaryPhotoViewerProps) => {
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

export default DiaryPhotoViewer;
