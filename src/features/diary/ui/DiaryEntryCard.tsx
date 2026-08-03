import { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as globalStyles from '@features/shared/styles/global';

import useDiaryEntryCard from '../model/hooks/useDiaryEntryCard';
import { MEAL_RELATION_PRESENTATION } from '../model/mealRelationPresentation';
import type { DiaryEntry } from '../model/types';
import * as styles from '../styles/DiaryEntryCard';

import DiaryEntryPhoto from './DiaryEntryPhoto';
import DiaryTextModal from './DiaryTextModal';
import DiaryTextPreview from './DiaryTextPreview';

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  isVisible?: boolean;
  synchronizing?: boolean;
  onPress?: (entry: DiaryEntry) => void;
  onOpenPhoto?: (entry: DiaryEntry) => void;
};

const metricIcons = {
  glucose: 'water',
  carbsGram: 'leaf-outline',
  shortInsulin: 'medical-outline',
  longInsulin: 'shield-checkmark-outline',
} as const;

const DiaryEntryCard = ({
  entry,
  isVisible = false,
  synchronizing = false,
  onPress,
  onOpenPhoto,
}: DiaryEntryCardProps) => {
  const theme = useTheme();

  const {
    dateTimeLabel,
    metrics,
    comment,
    commentTitle,
    aiAnalysis,
    aiAnalysisTitle,
    editAccessibilityLabel,
    mealRelationLabel,
    pendingDelete,
    actionsDisabled,
    cardInteractive,
    photoInteractive,
    openedText,
    syncStatus,
    handleCardPress,
    handlePhotoPress,
    handleOpenComment,
    handleOpenAiAnalysis,
    handleCloseText,
  } = useDiaryEntryCard({
    entry,
    synchronizing,
    onPress,
    onOpenPhoto,
  });

  const mealRelationPresentation =
    entry.mealRelation === null
      ? null
      : MEAL_RELATION_PRESENTATION[entry.mealRelation];

  return (
    <>
      <Pressable
        disabled={!cardInteractive}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? editAccessibilityLabel : undefined}
        accessibilityState={
          onPress
            ? {
                disabled: !cardInteractive,
              }
            : undefined
        }
        onPress={cardInteractive ? handleCardPress : undefined}
        style={({ pressed }) => [
          styles.Card(theme, pendingDelete),
          pressed && cardInteractive && styles.Pressed,
        ]}
      >
        <DiaryEntryPhoto
          entryId={entry.id}
          localPhotoUri={entry.localPhotoUri}
          photoUrl={entry.photoUrl}
          isVisible={isVisible}
          disabled={actionsDisabled}
          onPress={photoInteractive ? handlePhotoPress : undefined}
        />

        <View style={styles.Body(theme)}>
          <View style={styles.Header(theme)}>
            <View style={styles.Time(theme)}>
              <Ionicons
                name="time-outline"
                size={theme.size.lg}
                color={theme.colors.primary}
              />

              <Text style={styles.TimeText(theme)} numberOfLines={1}>
                {dateTimeLabel}
              </Text>
            </View>

            {mealRelationLabel !== null &&
              mealRelationPresentation !== null && (
                <View
                  style={styles.MealRelation(
                    theme,
                    mealRelationPresentation.tone
                  )}
                >
                  <Ionicons
                    name={mealRelationPresentation.icon}
                    size={theme.size.base}
                    color={theme.colors[mealRelationPresentation.tone]}
                  />

                  <Text
                    style={styles.MealRelationText(
                      theme,
                      mealRelationPresentation.tone
                    )}
                  >
                    {mealRelationLabel}
                  </Text>
                </View>
              )}
          </View>

          {metrics.length > 0 && (
            <View style={styles.Metrics(theme)}>
              {metrics.map((metric) => (
                <View
                  key={metric.key}
                  accessible
                  accessibilityLabel={`${metric.label}: ${metric.value}`}
                  style={styles.Metric(theme, metric.key)}
                >
                  <View style={styles.MetricIcon}>
                    <Ionicons
                      name={metricIcons[metric.key]}
                      size={theme.size.xl}
                      color={theme.colors.metrics[metric.key].text}
                    />
                  </View>

                  <Text style={styles.MetricValue(theme, metric.key)}>
                    {metric.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {comment.length > 0 && (
            <DiaryTextPreview
              title={commentTitle}
              text={comment}
              disabled={actionsDisabled}
              onOpen={handleOpenComment}
            />
          )}

          {aiAnalysis.length > 0 && (
            <DiaryTextPreview
              title={aiAnalysisTitle}
              text={aiAnalysis}
              disabled={actionsDisabled}
              onOpen={handleOpenAiAnalysis}
            />
          )}
        </View>

        <View style={styles.Status(theme)}>
          {syncStatus.loading ? (
            <ActivityIndicator size="small" color={syncStatus.color} />
          ) : (
            <Ionicons
              name={syncStatus.icon}
              size={theme.size.md}
              color={syncStatus.color}
            />
          )}

          <Text style={globalStyles.Caption(theme)}>{syncStatus.label}</Text>
        </View>
      </Pressable>

      <DiaryTextModal
        visible={openedText.visible}
        title={openedText.title}
        text={openedText.value}
        onClose={handleCloseText}
      />
    </>
  );
};

export default memo(DiaryEntryCard);
