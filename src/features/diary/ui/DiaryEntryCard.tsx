import { type ComponentProps, memo, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { dateKit } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

import type { DiaryEntry } from '../model';
import * as styles from '../styles/DiaryEntryCard';

import DiaryTextModal from './DiaryTextModal';
import DiaryTextPreview from './DiaryTextPreview';

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  synchronizing?: boolean;
  onPress?: (entry: DiaryEntry) => void;
};

type DiaryMetric = {
  key: string;
  label: string;
  value: string;
};

type DiaryTextKey = 'comment' | 'aiAnalysis';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const DiaryEntryCard = ({
  entry,
  synchronizing = false,
  onPress,
}: DiaryEntryCardProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const [openedText, setOpenedText] = useState<DiaryTextKey | null>(null);

  const locale = i18n.resolvedLanguage ?? i18n.language;

  const dateTimeLabel = dateKit.relativeDateTimeLabel(entry.eventAt);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const metrics: DiaryMetric[] = [];

  if (entry.glucose !== null) {
    metrics.push({
      key: 'glucose',
      label: t('diary.entry.metrics.glucose'),
      value: `${numberFormatter.format(entry.glucose)} ${t(
        'diary.entry.units.glucose'
      )}`,
    });
  }

  if (entry.shortInsulin !== null) {
    metrics.push({
      key: 'shortInsulin',
      label: t('diary.entry.metrics.shortInsulin'),
      value: `${numberFormatter.format(entry.shortInsulin)} ${t(
        'diary.entry.units.insulin'
      )}`,
    });
  }

  if (entry.longInsulin !== null) {
    metrics.push({
      key: 'longInsulin',
      label: t('diary.entry.metrics.longInsulin'),
      value: `${numberFormatter.format(entry.longInsulin)} ${t(
        'diary.entry.units.insulin'
      )}`,
    });
  }

  if (entry.carbsGram !== null) {
    metrics.push({
      key: 'carbsGram',
      label: t('diary.entry.metrics.carbohydrates'),
      value: `${numberFormatter.format(entry.carbsGram)} ${t(
        'diary.entry.units.carbohydrates'
      )}`,
    });
  }

  const comment = entry.comment.trim();
  const aiAnalysis = entry.aiAnalysis.trim();

  const pendingDelete = entry.syncStatus === 'pendingDelete';
  const interactive = Boolean(onPress) && !pendingDelete && !synchronizing;
  const actionsDisabled = pendingDelete || synchronizing;

  const openedTextTitle =
    openedText === 'comment'
      ? t('diary.entry.comment')
      : openedText === 'aiAnalysis'
        ? t('diary.entry.aiAnalysis')
        : '';

  const openedTextValue =
    openedText === 'comment'
      ? comment
      : openedText === 'aiAnalysis'
        ? aiAnalysis
        : '';

  let syncIcon: IoniconName = 'cloud-done-outline';
  let syncLabel = t('diary.entry.sync.synced');
  let syncColor = theme.colors.success;

  if (pendingDelete) {
    syncIcon = 'trash-outline';
    syncLabel = t('diary.entry.sync.deleting');
    syncColor = theme.colors.muted;
  } else if (entry.syncStatus !== 'synced') {
    syncIcon = 'cloud-offline-outline';
    syncLabel = t('diary.entry.sync.pending');
    syncColor = theme.colors.warning;
  }

  return (
    <>
      <Pressable
        disabled={!interactive}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityState={
          onPress
            ? {
                disabled: !interactive,
              }
            : undefined
        }
        onPress={
          onPress
            ? () => {
                onPress(entry);
              }
            : undefined
        }
        style={({ pressed }) => [
          styles.Card(theme, pendingDelete),
          pressed && interactive && styles.Pressed,
        ]}
      >
        <View style={styles.Header(theme)}>
          <View style={globalStyles.FlexItem}>
            <Text style={globalStyles.Subheading(theme)} numberOfLines={1}>
              {dateTimeLabel}
            </Text>
          </View>

          {entry.mealRelation !== null && (
            <View style={styles.MealRelation(theme)}>
              <Text style={globalStyles.Text(theme, 'sm', 'medium', 'primary')}>
                {t(`diary.entry.mealRelation.${entry.mealRelation}`)}
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
            title={t('diary.entry.comment')}
            text={comment}
            disabled={actionsDisabled}
            onOpen={() => setOpenedText('comment')}
          />
        )}

        {aiAnalysis.length > 0 && (
          <DiaryTextPreview
            title={t('diary.entry.aiAnalysis')}
            text={aiAnalysis}
            disabled={actionsDisabled}
            onOpen={() => setOpenedText('aiAnalysis')}
          />
        )}

        <View style={globalStyles.Divider(theme)} />

        <View style={styles.Status(theme)}>
          {synchronizing && !pendingDelete ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name={syncIcon} size={theme.size.md} color={syncColor} />
          )}

          <Text style={globalStyles.Caption(theme)}>
            {synchronizing && !pendingDelete
              ? t('diary.entry.sync.synchronizing')
              : syncLabel}
          </Text>
        </View>
      </Pressable>

      <DiaryTextModal
        visible={openedText !== null}
        title={openedTextTitle}
        text={openedTextValue}
        onClose={() => setOpenedText(null)}
      />
    </>
  );
};

export default memo(DiaryEntryCard);
