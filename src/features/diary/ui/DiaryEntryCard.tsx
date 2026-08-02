import { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as globalStyles from '@features/shared/styles/global';

import useDiaryEntryCard from '../model/hooks/useDiaryEntryCard';
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

  return (
    <>
      <Pressable
        disabled={!cardInteractive}
        accessibilityRole={onPress ? 'button' : undefined}
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

        <View style={styles.Header(theme)}>
          <View style={globalStyles.FlexItem}>
            <Text style={globalStyles.Subheading(theme)} numberOfLines={1}>
              {dateTimeLabel}
            </Text>
          </View>

          {mealRelationLabel !== null && (
            <View style={styles.MealRelation(theme)}>
              <Text style={globalStyles.Text(theme, 'sm', 'medium', 'primary')}>
                {mealRelationLabel}
              </Text>
            </View>
          )}
        </View>

        {metrics.length > 0 && (
          <View style={styles.Metrics(theme)}>
            {metrics.map((metric) => (
              <View key={metric.key} style={styles.Metric(theme)}>
                <Text style={globalStyles.Caption(theme)}>{metric.label}</Text>

                <Text style={globalStyles.Text(theme, 'sm', 'semibold')}>
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

        <View style={globalStyles.Divider(theme)} />

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
