import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNetwork } from '@features/network/model';

type UseDiaryEntryPhotoParams = {
  localPhotoUri: string | null;
  photoUrl: string | null;
  isVisible: boolean;
};

const normalizeUri = (uri: string | null): string | null => {
  const normalizedUri = uri?.trim();

  return normalizedUri ? normalizedUri : null;
};

const useDiaryEntryPhoto = ({
  localPhotoUri,
  photoUrl,
  isVisible,
}: UseDiaryEntryPhotoParams) => {
  const { t } = useTranslation();
  const { isOnline, isOffline } = useNetwork();

  const normalizedLocalPhotoUri = normalizeUri(localPhotoUri);
  const normalizedPhotoUrl = normalizeUri(photoUrl);

  const [failedLocalPhotoUri, setFailedLocalPhotoUri] = useState<string | null>(
    null
  );

  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const hasLocalPhoto = normalizedLocalPhotoUri !== null;
  const hasCloudPhoto = normalizedPhotoUrl !== null;
  const hasPhoto = hasLocalPhoto || hasCloudPhoto;

  const localPhotoFailed =
    normalizedLocalPhotoUri !== null &&
    failedLocalPhotoUri === normalizedLocalPhotoUri;

  const cloudPhotoFailed =
    normalizedPhotoUrl !== null && failedPhotoUrl === normalizedPhotoUrl;

  const availableLocalPhotoUri =
    normalizedLocalPhotoUri !== null && !localPhotoFailed
      ? normalizedLocalPhotoUri
      : null;

  const availablePhotoUrl =
    normalizedPhotoUrl !== null && !cloudPhotoFailed
      ? normalizedPhotoUrl
      : null;

  const sourceUri =
    availableLocalPhotoUri ??
    (isVisible && isOnline ? availablePhotoUrl : null);

  const localOnly = hasLocalPhoto && !hasCloudPhoto;

  const cloudOnly = !hasLocalPhoto && hasCloudPhoto;

  const cloudOnlyOffline =
    isOffline && availableLocalPhotoUri === null && hasCloudPhoto;

  const hasLoadError = localPhotoFailed || cloudPhotoFailed;

  const fallbackText = cloudOnlyOffline
    ? t('diary.entry.photo.unavailableOffline')
    : sourceUri === null && hasLoadError
      ? t('diary.entry.photo.loadFailed')
      : null;

  const indicatorLabel = localOnly
    ? t('diary.entry.photo.localOnly')
    : cloudOnly
      ? t('diary.entry.photo.cloudOnly')
      : null;

  const photoAccessibilityLabel = t('diary.entry.photo.accessibilityLabel');

  const openAccessibilityLabel = t('diary.entry.photo.openAccessibilityLabel');

  useEffect(() => {
    setLoading(sourceUri !== null);
  }, [sourceUri]);

  const onLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const onError = useCallback(() => {
    setLoading(false);

    if (sourceUri === normalizedLocalPhotoUri) {
      setFailedLocalPhotoUri(normalizedLocalPhotoUri);

      return;
    }

    if (sourceUri === normalizedPhotoUrl) {
      setFailedPhotoUrl(normalizedPhotoUrl);
    }
  }, [normalizedLocalPhotoUri, normalizedPhotoUrl, sourceUri]);

  return {
    hasPhoto,
    sourceUri,
    loading,
    localOnly,
    cloudOnly,
    cloudOnlyOffline,
    fallbackText,
    indicatorLabel,
    photoAccessibilityLabel,
    openAccessibilityLabel,
    onLoadStart,
    onLoad,
    onError,
  };
};

export default useDiaryEntryPhoto;
