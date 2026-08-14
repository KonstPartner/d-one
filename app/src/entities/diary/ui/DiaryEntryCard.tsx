import { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import type { DiaryEntry } from '../model/diaryEntry';
import { MEAL_RELATION_PRESENTATION } from '../model/mealRelationPresentation';
import { useDiaryEntryCard } from '../model/useDiaryEntryCard';
import * as s from '../styles/DiaryEntryCard';

import { DiaryEntryCardShell } from './DiaryEntryCardShell';
import { DiaryEntryPhoto } from './DiaryEntryPhoto';
import { DiaryEntryTextSections } from './DiaryEntryTextSections';

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

    photoInteractive,

    syncStatus,

    handleCardPress,
    handlePhotoPress,
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
    <DiaryEntryCardShell
      testID={`diary-entry-card-${entry.id}`}
      disabled={actionsDisabled}
      dimmed={pendingDelete}
      accessibilityLabel={
        onPress !== undefined ? editAccessibilityLabel : undefined
      }
      onPress={onPress !== undefined ? handleCardPress : undefined}
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

          {mealRelationLabel !== null && mealRelationPresentation !== null && (
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

        <DiaryEntryTextSections
          comment={comment}
          commentTitle={commentTitle}
          aiAnalysis={aiAnalysis}
          aiAnalysisTitle={aiAnalysisTitle}
          disabled={actionsDisabled}
        />

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
    </DiaryEntryCardShell>
  );
};

export const DiaryEntryCard = memo(DiaryEntryCardComponent);
