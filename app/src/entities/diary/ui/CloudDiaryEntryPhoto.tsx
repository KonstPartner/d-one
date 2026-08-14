import { memo } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { GestureResponderEvent } from 'react-native';

import { useCloudDiaryPhoto } from '../model/useCloudDiaryPhoto';
import * as s from '../styles/DiaryEntryPhoto';

type CloudDiaryEntryPhotoProps = {
  entryId: string;
  photoUrl: string | null;

  isVisible: boolean;

  disabled?: boolean;

  onPress?: () => void;
};

const CloudDiaryEntryPhotoComponent = ({
  entryId,
  photoUrl,

  isVisible,

  disabled = false,

  onPress,
}: CloudDiaryEntryPhotoProps) => {
  const theme = useTheme();

  const {
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
  } = useCloudDiaryPhoto({
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
          cachePolicy="memory-disk"
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
            name={
              unavailableOffline ? 'cloud-offline-outline' : 'image-outline'
            }
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
    </s.Frame>
  );
};

export const CloudDiaryEntryPhoto = memo(CloudDiaryEntryPhotoComponent);
