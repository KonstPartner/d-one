import { memo } from 'react';
import { useTheme } from '@emotion/react';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { GestureResponderEvent } from 'react-native';

import { useDiaryEntryPhoto } from '../model/useDiaryEntryPhoto';
import * as s from '../styles/DiaryEntryPhoto';

type DiaryEntryPhotoProps = {
  entryId: string;

  localPhotoUri: string | null;
  photoUrl: string | null;

  isVisible: boolean;

  disabled?: boolean;

  onPress?: () => void;
};

const DiaryEntryPhotoComponent = ({
  entryId,

  localPhotoUri,
  photoUrl,

  isVisible,

  disabled = false,

  onPress,
}: DiaryEntryPhotoProps) => {
  const theme = useTheme();

  const {
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
  } = useDiaryEntryPhoto({
    localPhotoUri,
    photoUrl,
    isVisible,
  });

  if (!hasPhoto) {
    return null;
  }

  const hasPressAction = onPress !== undefined;

  const interactive = hasPressAction && !disabled;

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (interactive) {
      onPress?.();
    }
  };

  return (
    <s.Frame
      disabled={!interactive}
      pointerEvents={hasPressAction ? 'auto' : 'none'}
      accessibilityRole={hasPressAction ? 'button' : 'image'}
      accessibilityLabel={
        hasPressAction ? openAccessibilityLabel : photoAccessibilityLabel
      }
      accessibilityHint={indicatorLabel ?? undefined}
      accessibilityState={
        hasPressAction
          ? {
              disabled: !interactive,
            }
          : undefined
      }
      onPress={hasPressAction ? handlePress : undefined}
      $interactive={interactive}
    >
      {sourceUri !== null && sourceKey !== null && (
        <s.Image
          key={`${entryId}:${sourceKey}`}
          source={{
            uri: sourceUri,

            cacheKey: sourceKey,
          }}
          contentFit="cover"
          cachePolicy={sourceIsLocal ? 'none' : 'memory-disk'}
          recyclingKey={`${entryId}:${sourceKey}`}
          transition={150}
          accessible={false}
          onLoadStart={onLoadStart}
          onLoad={onLoad}
          onError={onError}
        />
      )}

      {sourceUri === null && (
        <s.CenteredOverlay pointerEvents="none">
          <Ionicons
            name={cloudOnlyOffline ? 'cloud-offline-outline' : 'image-outline'}
            size={theme.size.xl}
            color={theme.colors.muted}
          />

          {fallbackText !== null && (
            <s.FallbackText>{fallbackText}</s.FallbackText>
          )}
        </s.CenteredOverlay>
      )}

      {loading && (
        <s.CenteredOverlay pointerEvents="none">
          <s.Loader color={theme.colors.primary} />
        </s.CenteredOverlay>
      )}

      {(localOnly || cloudOnly) && (
        <s.Indicator pointerEvents="none">
          <Ionicons
            name={
              localOnly ? 'cloud-offline-outline' : 'cloud-download-outline'
            }
            size={theme.size.lg}
            color={theme.colors.white}
          />
        </s.Indicator>
      )}
    </s.Frame>
  );
};

export const DiaryEntryPhoto = memo(DiaryEntryPhotoComponent);
