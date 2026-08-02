import { memo } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';

import * as globalStyles from '@features/shared/styles/global';

import useDiaryEntryPhoto from '../model/hooks/useDiaryEntryPhoto';
import * as styles from '../styles/DiaryEntryPhoto';

type DiaryEntryPhotoProps = {
  entryId: string;
  localPhotoUri: string | null;
  photoUrl: string | null;
  isVisible: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const DiaryEntryPhoto = ({
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
      onPress();
    }
  };

  return (
    <Pressable
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
      style={({ pressed }) => [
        styles.Frame(theme),
        pressed && interactive && styles.Pressed,
      ]}
    >
      {sourceUri !== null && (
        <Image
          source={sourceUri}
          style={styles.Image}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={entryId}
          transition={150}
          accessible={false}
          onLoadStart={onLoadStart}
          onLoad={onLoad}
          onError={onError}
        />
      )}

      {sourceUri === null && (
        <View style={styles.CenteredOverlay(theme)} pointerEvents="none">
          <Ionicons
            name={cloudOnlyOffline ? 'cloud-offline-outline' : 'image-outline'}
            size={theme.size.xl}
            color={theme.colors.muted}
          />

          {fallbackText !== null && (
            <Text
              style={[globalStyles.Caption(theme), styles.FallbackText(theme)]}
            >
              {fallbackText}
            </Text>
          )}
        </View>
      )}

      {loading && (
        <View style={styles.CenteredOverlay(theme)} pointerEvents="none">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      {(localOnly || cloudOnly) && (
        <View style={styles.Indicator(theme)} pointerEvents="none">
          <Ionicons
            name={
              localOnly ? 'cloud-offline-outline' : 'cloud-download-outline'
            }
            size={theme.size.lg}
            color={theme.colors.white}
          />
        </View>
      )}
    </Pressable>
  );
};

export default memo(DiaryEntryPhoto);
