import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { PortalModal, Spinner } from '@shared/ui';

import type { OwnerDiaryPreparationState } from '../model/useOwnerDiaryPreparation';
import * as s from '../styles/OwnerDiaryPreparationModal';

type OwnerDiaryPreparationModalProps = {
  entry: OwnerDiaryPreparationState | null;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ignoreClose = () => undefined;

const localStyles = StyleSheet.create({
  aiBorder: {
    ...StyleSheet.absoluteFillObject,
  },

  aiCard: {
    borderWidth: 0,
  },

  aiShell: {
    borderRadius: 21,
    overflow: 'hidden',
    padding: 2,
    position: 'relative',
  },
});

export const OwnerDiaryPreparationModal = ({
  entry,
}: OwnerDiaryPreparationModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const borderProgress = useSharedValue(0);

  const [aiBorderSize, setAiBorderSize] = useState({
    height: 0,
    width: 0,
  });

  const phase = entry?.phase ?? null;

  const isAnalyzingAi = phase === 'analyzingAi';
  const isAnalysisReady = phase === 'analysisReady';

  useEffect(() => {
    if (!isAnalyzingAi) {
      cancelAnimation(borderProgress);

      return;
    }

    borderProgress.value = 0;

    borderProgress.value = withRepeat(
      withTiming(1, {
        duration: 1_250,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(borderProgress);
    };
  }, [borderProgress, isAnalyzingAi]);

  const aiBorderWidth = Math.max(aiBorderSize.width - 3, 0);
  const aiBorderHeight = Math.max(aiBorderSize.height - 3, 0);

  const aiBorderPerimeter = 2 * (aiBorderWidth + aiBorderHeight);

  const aiBorderSegment = aiBorderPerimeter * 0.28;

  const animatedBorderProps = useAnimatedProps(
    () => ({
      strokeDashoffset: -aiBorderPerimeter * borderProgress.value,
    }),
    [aiBorderPerimeter]
  );

  const handleAiBorderLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent): void => {
    setAiBorderSize({
      height: layout.height,
      width: layout.width,
    });
  };

  const footerText = isAnalysisReady
    ? t('diaryAi.preparation.analysisSavedReturning')
    : entry?.requestAi
      ? t('diaryAi.preparation.preparing')
      : t('diary.form.preparation.photoPreparing');

  return (
    <PortalModal
      visible={entry !== null}
      onClose={ignoreClose}
      withoutCloseBtn
      isDisabled
    >
      <s.Content>
        <s.SavedCard>
          <s.SavedIcon>
            <Ionicons
              name="checkmark"
              size={theme.size.lg}
              color={theme.colors.success}
            />
          </s.SavedIcon>

          <s.SavedContent>
            <s.SavedTitle>
              {t('diary.form.preparation.savedLocally')}
            </s.SavedTitle>
          </s.SavedContent>
        </s.SavedCard>

        {entry?.photoStepVisible && (
          <s.StatusCard
            style={
              entry.photoUploaded
                ? {
                    borderColor: theme.colors.shades.success.lg,
                    backgroundColor: theme.colors.shades.success.sm,
                  }
                : undefined
            }
          >
            <s.PhotoFrame>
              {entry.photoUri ? (
                <s.Photo
                  source={{
                    uri: entry.photoUri,
                  }}
                  contentFit="cover"
                  cachePolicy="none"
                />
              ) : (
                <s.PhotoPlaceholder>
                  <Ionicons
                    name="image-outline"
                    size={theme.size.xl}
                    color={theme.colors.muted}
                  />
                </s.PhotoPlaceholder>
              )}
            </s.PhotoFrame>

            <s.StatusContent>
              <s.StatusTitle
                style={
                  entry.photoUploaded
                    ? {
                        color: theme.colors.success,
                      }
                    : undefined
                }
              >
                {t('diary.form.preparation.uploadingPhoto')}
              </s.StatusTitle>

              <s.StatusDescription>
                {t('diary.form.preparation.finalizingPhoto')}
              </s.StatusDescription>
            </s.StatusContent>

            <s.LoaderBox
              style={
                entry.photoUploaded
                  ? {
                      backgroundColor: theme.colors.card,
                    }
                  : undefined
              }
            >
              {entry.photoUploaded ? (
                <Ionicons
                  name="checkmark"
                  size={theme.size.lg}
                  color={theme.colors.success}
                />
              ) : (
                <Spinner size={22} color={theme.colors.primary} />
              )}
            </s.LoaderBox>
          </s.StatusCard>
        )}

        {(isAnalyzingAi || isAnalysisReady) && (
          <Animated.View
            onLayout={handleAiBorderLayout}
            style={[
              localStyles.aiShell,
              {
                backgroundColor: isAnalysisReady
                  ? theme.colors.shades.success.lg
                  : theme.colors.border,
              },
            ]}
          >
            {isAnalyzingAi && aiBorderPerimeter > 0 && (
              <Svg
                pointerEvents="none"
                style={localStyles.aiBorder}
                width={aiBorderSize.width}
                height={aiBorderSize.height}
              >
                <Defs>
                  <LinearGradient
                    id="aiPreparationBorder"
                    x1="0"
                    y1="0"
                    x2={aiBorderSize.width}
                    y2={aiBorderSize.height}
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop offset="0" stopColor={theme.colors.primary} />

                    <Stop offset="0.5" stopColor={theme.colors.warning} />

                    <Stop offset="1" stopColor={theme.colors.primary} />
                  </LinearGradient>
                </Defs>

                <AnimatedRect
                  animatedProps={animatedBorderProps}
                  x={1.5}
                  y={1.5}
                  width={aiBorderWidth}
                  height={aiBorderHeight}
                  rx={19}
                  fill="none"
                  stroke="url(#aiPreparationBorder)"
                  strokeWidth={3}
                  strokeDasharray={`${aiBorderSegment} ${
                    aiBorderPerimeter - aiBorderSegment
                  }`}
                  strokeLinecap="round"
                />
              </Svg>
            )}

            <s.StatusCard style={localStyles.aiCard}>
              <s.StatusIconBox
                style={
                  isAnalysisReady
                    ? {
                        backgroundColor: theme.colors.shades.success.sm,
                      }
                    : undefined
                }
              >
                <Ionicons
                  name={isAnalysisReady ? 'checkmark' : 'sparkles-outline'}
                  size={theme.size.xl}
                  color={
                    isAnalysisReady
                      ? theme.colors.success
                      : theme.colors.primary
                  }
                />
              </s.StatusIconBox>

              <s.StatusContent>
                <s.StatusTitle
                  style={
                    isAnalysisReady
                      ? {
                          color: theme.colors.success,
                        }
                      : undefined
                  }
                >
                  {isAnalysisReady
                    ? t('diaryAi.preparation.analysisReady')
                    : t('diaryAi.preparation.analyzing')}
                </s.StatusTitle>

                <s.StatusDescription selectable={isAnalysisReady}>
                  {isAnalysisReady && entry?.aiAnalysis
                    ? entry.aiAnalysis
                    : t('diaryAi.preparation.analyzingDescription')}
                </s.StatusDescription>
              </s.StatusContent>
            </s.StatusCard>
          </Animated.View>
        )}

        <s.FooterText>{footerText}</s.FooterText>
      </s.Content>
    </PortalModal>
  );
};
