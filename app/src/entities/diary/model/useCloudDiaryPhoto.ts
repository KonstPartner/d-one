import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

type UseCloudDiaryPhotoParams = {
  photoUrl: string | null;
  isVisible: boolean;
};

const IMAGE_LOAD_TIMEOUT_MS = 15_000;

const normalizeUri = (uri: string | null): string | null => {
  const normalizedUri = uri?.trim();

  return normalizedUri ? normalizedUri : null;
};

export const useCloudDiaryPhoto = ({
  photoUrl,
  isVisible,
}: UseCloudDiaryPhotoParams) => {
  const { t } = useTranslation();

  const { isOnline, isOffline } = useNetwork();

  const normalizedPhotoUrl = normalizeUri(photoUrl);

  const notifiedPhotoUrlRef = useRef<string | null>(null);

  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const hasPhoto = normalizedPhotoUrl !== null;

  const photoFailed =
    normalizedPhotoUrl !== null && failedPhotoUrl === normalizedPhotoUrl;

  const availablePhotoUrl =
    normalizedPhotoUrl !== null && !photoFailed ? normalizedPhotoUrl : null;

  const sourceUri = isVisible && isOnline ? availablePhotoUrl : null;

  const sourceKey = sourceUri === null ? null : sourceUri;

  const unavailableOffline = isOffline && hasPhoto;

  const fallbackText = unavailableOffline
    ? t('diary.entry.photo.unavailableOffline')
    : sourceUri === null && photoFailed
      ? t('diary.entry.photo.loadFailed')
      : null;

  const photoAccessibilityLabel = t('diary.entry.photo.accessibilityLabel');

  const openAccessibilityLabel = t('diary.entry.photo.openAccessibilityLabel');

  useEffect(() => {
    setFailedPhotoUrl(null);
    notifiedPhotoUrlRef.current = null;
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

    if (normalizedPhotoUrl === null || sourceUri !== normalizedPhotoUrl) {
      return;
    }

    setFailedPhotoUrl(normalizedPhotoUrl);

    if (notifiedPhotoUrlRef.current === normalizedPhotoUrl) {
      return;
    }

    notifiedPhotoUrlRef.current = normalizedPhotoUrl;

    showNotification(
      'error',
      t(
        isOffline
          ? 'diary.entry.photo.unavailableOffline'
          : 'diary.entry.photo.loadFailed'
      )
    );
  }, [isOffline, normalizedPhotoUrl, sourceUri, t]);

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

    loading,

    unavailableOffline,
    fallbackText,

    photoAccessibilityLabel,
    openAccessibilityLabel,

    onLoadStart,
    onLoad,
    onError,
  };
};
