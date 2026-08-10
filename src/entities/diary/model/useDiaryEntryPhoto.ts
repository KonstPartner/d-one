import { useCallback, useEffect, useRef, useState } from 'react';
import { File } from 'expo-file-system';
import { useTranslation } from 'react-i18next';

import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

type UseDiaryEntryPhotoParams = {
  localPhotoUri: string | null;

  photoUrl: string | null;

  isVisible: boolean;
};

const IMAGE_LOAD_TIMEOUT_MS = 15_000;

const normalizeUri = (uri: string | null): string | null => {
  const normalizedUri = uri?.trim();

  return normalizedUri ? normalizedUri : null;
};

const createLocalPhotoSourceKey = (localPhotoUri: string): string => {
  try {
    const photoFile = new File(localPhotoUri);

    const modificationTime = photoFile.modificationTime ?? 0;

    return [localPhotoUri, modificationTime, photoFile.size].join(':');
  } catch {
    return localPhotoUri;
  }
};

export const useDiaryEntryPhoto = ({
  localPhotoUri,
  photoUrl,
  isVisible,
}: UseDiaryEntryPhotoParams) => {
  const { t } = useTranslation();

  const { isOnline, isOffline } = useNetwork();

  const normalizedLocalPhotoUri = normalizeUri(localPhotoUri);

  const normalizedPhotoUrl = normalizeUri(photoUrl);

  const localPhotoSourceKey =
    normalizedLocalPhotoUri === null
      ? null
      : createLocalPhotoSourceKey(normalizedLocalPhotoUri);

  const notifiedCloudPhotoUrlRef = useRef<string | null>(null);

  const [failedLocalPhotoSourceKey, setFailedLocalPhotoSourceKey] = useState<
    string | null
  >(null);

  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const hasLocalPhoto = normalizedLocalPhotoUri !== null;

  const hasCloudPhoto = normalizedPhotoUrl !== null;

  const hasPhoto = hasLocalPhoto || hasCloudPhoto;

  const localPhotoFailed =
    localPhotoSourceKey !== null &&
    failedLocalPhotoSourceKey === localPhotoSourceKey;

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

  const sourceIsLocal = availableLocalPhotoUri !== null;

  const sourceUri =
    availableLocalPhotoUri ??
    (isVisible && isOnline ? availablePhotoUrl : null);

  const sourceKey = sourceIsLocal
    ? localPhotoSourceKey
    : sourceUri === null
      ? null
      : sourceUri;

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
    setFailedLocalPhotoSourceKey(null);
  }, [localPhotoSourceKey]);

  useEffect(() => {
    setFailedPhotoUrl(null);

    notifiedCloudPhotoUrlRef.current = null;
  }, [normalizedPhotoUrl]);

  useEffect(() => {
    if (sourceUri === null) {
      setLoading(false);
    }
  }, [sourceUri]);

  const onLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const onError = useCallback(() => {
    setLoading(false);

    if (sourceIsLocal) {
      setFailedLocalPhotoSourceKey(localPhotoSourceKey);

      return;
    }

    if (sourceUri !== normalizedPhotoUrl) {
      return;
    }

    setFailedPhotoUrl(normalizedPhotoUrl);

    if (
      normalizedPhotoUrl !== null &&
      notifiedCloudPhotoUrlRef.current !== normalizedPhotoUrl
    ) {
      notifiedCloudPhotoUrlRef.current = normalizedPhotoUrl;

      showNotification(
        'error',
        t(
          isOffline
            ? 'diary.entry.photo.unavailableOffline'
            : 'diary.entry.photo.loadFailed'
        )
      );
    }
  }, [
    isOffline,
    localPhotoSourceKey,
    normalizedPhotoUrl,
    sourceIsLocal,
    sourceUri,
    t,
  ]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timeoutId = setTimeout(onError, IMAGE_LOAD_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading, onError, sourceKey]);

  return {
    hasPhoto,

    sourceUri,
    sourceKey,
    sourceIsLocal,

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
