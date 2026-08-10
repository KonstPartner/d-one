import { ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ImageLoadEventData } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import * as s from './styles';
import { usePhotoViewer } from './usePhotoViewer';

type FallbackIcon = 'image-outline' | 'cloud-offline-outline';

type PhotoViewerProps = {
  visible: boolean;

  sourceUri: string | null;
  sourceKey: string | null;
  sourceIsLocal: boolean;

  recyclingKey: string | null;

  loading: boolean;

  fallbackText: string | null;
  fallbackIcon?: FallbackIcon;

  accessibilityLabel: string;

  onLoadStart: () => void;
  onLoad: () => void;
  onError: () => void;
  onClose: () => void;
};

export const PhotoViewer = ({
  visible,
  sourceUri,
  sourceKey,
  sourceIsLocal,
  recyclingKey,
  loading,
  fallbackText,
  fallbackIcon = 'image-outline',
  accessibilityLabel,
  onLoadStart,
  onLoad,
  onError,
  onClose,
}: PhotoViewerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    gesture,
    imageLayout,
    animatedImageStyle,
    handleViewportLayout,
    handleImageLoad,
  } = usePhotoViewer({
    visible,
    enabled: sourceUri !== null,
    sourceKey,
    onLoad,
  });

  const imageRecyclingKey =
    sourceUri === null
      ? null
      : `${recyclingKey ?? 'photo'}:${sourceKey ?? sourceUri}`;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <s.GestureRoot>
        <s.Root
          testID="photo-viewer-root"
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
        >
          <GestureDetector gesture={gesture}>
            <s.Viewport
              testID="photo-viewer-viewport"
              onLayout={handleViewportLayout}
            >
              {sourceUri !== null && (
                <Animated.View
                  testID="photo-viewer-image-frame"
                  style={[
                    s.ImageFrame,
                    imageLayout ?? s.UnmeasuredImageFrame,
                    animatedImageStyle,
                  ]}
                >
                  <s.Photo
                    testID="photo-viewer-image"
                    source={{
                      uri: sourceUri,
                      cacheKey: sourceKey ?? sourceUri,
                    }}
                    contentFit="contain"
                    cachePolicy={sourceIsLocal ? 'none' : 'memory-disk'}
                    priority="high"
                    recyclingKey={imageRecyclingKey}
                    transition={150}
                    accessible
                    accessibilityLabel={accessibilityLabel}
                    onLoadStart={onLoadStart}
                    onLoad={(event: ImageLoadEventData) => {
                      handleImageLoad(event);
                    }}
                    onError={onError}
                  />
                </Animated.View>
              )}

              {sourceUri === null && (
                <s.StateOverlay pointerEvents="none">
                  <Ionicons
                    name={fallbackIcon}
                    size={theme.size['2xl']}
                    color={theme.colors.whiteAlpha.lg}
                  />

                  {fallbackText !== null && (
                    <s.StateText>{fallbackText}</s.StateText>
                  )}
                </s.StateOverlay>
              )}

              {loading && (
                <s.StateOverlay pointerEvents="none">
                  <ActivityIndicator size="large" color={theme.colors.white} />
                </s.StateOverlay>
              )}
            </s.Viewport>
          </GestureDetector>

          <s.Controls edges={['top']} pointerEvents="box-none">
            <s.CloseButton
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={theme.spacing.sm}
              onPress={onClose}
              style={({ pressed }) => (pressed ? s.Pressed : undefined)}
            >
              <Ionicons
                name="close"
                size={theme.size.xl}
                color={theme.colors.white}
              />
            </s.CloseButton>
          </s.Controls>

          {sourceUri !== null && !loading && (
            <s.HintArea edges={['bottom']} pointerEvents="none">
              <s.HintText>{t('common.photoViewer.hint')}</s.HintText>
            </s.HintArea>
          )}
        </s.Root>
      </s.GestureRoot>
    </Modal>
  );
};
