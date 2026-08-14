import { PhotoViewer } from '@shared/ui';

import type { CloudDiaryEntry } from '../model/cloudDiaryEntry';
import { useCloudDiaryPhoto } from '../model/useCloudDiaryPhoto';

type CloudDiaryPhotoViewerProps = {
  entry: CloudDiaryEntry | null;

  onClose: () => void;
};

export const CloudDiaryPhotoViewer = ({
  entry,
  onClose,
}: CloudDiaryPhotoViewerProps) => {
  const visible = entry !== null;

  const {
    sourceUri,
    sourceKey,

    loading,

    unavailableOffline,
    fallbackText,

    photoAccessibilityLabel,

    onLoadStart,
    onLoad,
    onError,
  } = useCloudDiaryPhoto({
    photoUrl: entry?.photoUrl ?? null,

    isVisible: visible,
  });

  return (
    <PhotoViewer
      visible={visible}
      sourceUri={sourceUri}
      sourceKey={sourceKey}
      sourceIsLocal={false}
      recyclingKey={entry?.id ?? null}
      loading={loading}
      fallbackText={fallbackText}
      fallbackIcon={
        unavailableOffline ? 'cloud-offline-outline' : 'image-outline'
      }
      accessibilityLabel={photoAccessibilityLabel}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      onError={onError}
      onClose={onClose}
    />
  );
};
