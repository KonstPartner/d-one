import { memo } from 'react';
import {
  ActivityIndicator,
  type PressableStateCallbackType,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import type { DiaryEntry } from '../model/diaryEntry';
import { MEAL_RELATION_PRESENTATION } from '../model/mealRelationPresentation';
import { useDiaryEntryCard } from '../model/useDiaryEntryCard';
import * as s from '../styles/DiaryEntryCard';

import { DiaryEntryPhoto } from './DiaryEntryPhoto';
import { DiaryTextModal } from './DiaryTextModal';
import { DiaryTextPreview } from './DiaryTextPreview';

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

const DiaryEntryCardComponent = ({
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
      <s.Card
        testID={`diary-entry-card-${entry.id}`}
        $pendingDelete={pendingDelete}
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
        style={({ pressed }: PressableStateCallbackType) => ({
          opacity: pendingDelete ? 0.5 : pressed && cardInteractive ? 0.72 : 1,
        })}
      >
        <DiaryEntryPhoto
          entryId={entry.id}
          localPhotoUri={entry.localPhotoUri}
          photoUrl={entry.photoUrl}
          isVisible={isVisible}
          disabled={actionsDisabled}
          onPress={photoInteractive ? handlePhotoPress : undefined}
        />

        <s.Body>
          <s.Header>
            <s.Time>
              <Ionicons
                name="time-outline"
                size={theme.size.lg}
                color={theme.colors.primary}
              />

              <s.TimeText numberOfLines={1}>{dateTimeLabel}</s.TimeText>
            </s.Time>

            {mealRelationLabel !== null &&
              mealRelationPresentation !== null && (
                <s.MealRelation $tone={mealRelationPresentation.tone}>
                  <Ionicons
                    name={mealRelationPresentation.icon}
                    size={theme.size.base}
                    color={theme.colors[mealRelationPresentation.tone]}
                  />

                  <s.MealRelationText $tone={mealRelationPresentation.tone}>
                    {mealRelationLabel}
                  </s.MealRelationText>
                </s.MealRelation>
              )}
          </s.Header>

          {metrics.length > 0 && (
            <s.Metrics>
              {metrics.map((metric) => (
                <s.Metric
                  key={metric.key}
                  $metric={metric.key}
                  accessible
                  accessibilityLabel={`${metric.label}: ${metric.value}`}
                >
                  <s.MetricIcon>
                    <Ionicons
                      name={metricIcons[metric.key]}
                      size={theme.size.xl}
                      color={theme.colors.metrics[metric.key].text}
                    />
                  </s.MetricIcon>

                  <s.MetricValue $metric={metric.key}>
                    {metric.value}
                  </s.MetricValue>
                </s.Metric>
              ))}
            </s.Metrics>
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

          <s.Status accessible accessibilityLabel={syncStatus.label}>
            {syncStatus.loading ? (
              <ActivityIndicator size="small" color={syncStatus.color} />
            ) : (
              <Ionicons
                name={syncStatus.icon}
                size={theme.size.md}
                color={syncStatus.color}
              />
            )}
          </s.Status>
        </s.Body>
      </s.Card>

      <DiaryTextModal
        visible={openedText.visible}
        title={openedText.title}
        text={openedText.value}
        onClose={handleCloseText}
      />
    </>
  );
};

export const DiaryEntryCard = memo(DiaryEntryCardComponent);
