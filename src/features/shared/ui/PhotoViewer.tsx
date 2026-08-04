import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageLoadEventData } from 'expo-image';
import { useTranslation } from 'react-i18next';
import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import usePhotoViewer from '../model/hooks/usePhotoViewer';
import * as styles from '../styles/PhotoViewer';

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

const PhotoViewer = ({
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
      <GestureHandlerRootView style={styles.Root(theme)}>
        <View
          testID="photo-viewer-root"
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={styles.Root(theme)}
        >
          <GestureDetector gesture={gesture}>
            <View
              testID="photo-viewer-viewport"
              style={styles.Viewport}
              onLayout={handleViewportLayout}
            >
              {sourceUri !== null && (
                <Animated.View
                  testID="photo-viewer-image-frame"
                  style={[
                    styles.ImageFrame,
                    imageLayout ?? styles.UnmeasuredImageFrame,
                    animatedImageStyle,
                  ]}
                >
                  <Image
                    testID="photo-viewer-image"
                    source={{
                      uri: sourceUri,
                      cacheKey: sourceKey ?? sourceUri,
                    }}
                    style={styles.Image}
                    contentFit="contain"
                    cachePolicy={sourceIsLocal ? 'none' : 'memory-disk'}
                    priority="high"
                    recyclingKey={imageRecyclingKey}
                    transition={150}
                    accessible
                    accessibilityLabel={accessibilityLabel}
                    onLoadStart={onLoadStart}
                    onLoad={(event: ImageLoadEventData) =>
                      handleImageLoad(event)
                    }
                    onError={onError}
                  />
                </Animated.View>
              )}

              {sourceUri === null && (
                <View pointerEvents="none" style={styles.StateOverlay}>
                  <Ionicons
                    name={fallbackIcon}
                    size={theme.size['2xl']}
                    color={theme.colors.whiteAlpha.lg}
                  />

                  {fallbackText !== null && (
                    <Text style={styles.StateText(theme)}>{fallbackText}</Text>
                  )}
                </View>
              )}

              {loading && (
                <View pointerEvents="none" style={styles.StateOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.white} />
                </View>
              )}
            </View>
          </GestureDetector>

          <SafeAreaView
            edges={['top']}
            pointerEvents="box-none"
            style={styles.Controls(theme)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.CloseButton(theme),
                pressed && styles.Pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={theme.size.xl}
                color={theme.colors.white}
              />
            </Pressable>
          </SafeAreaView>

          {sourceUri !== null && !loading && (
            <SafeAreaView
              edges={['bottom']}
              pointerEvents="none"
              style={styles.HintArea(theme)}
            >
              <Text style={styles.HintText(theme)}>
                {t('common.photoViewer.hint')}
              </Text>
            </SafeAreaView>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default PhotoViewer;
