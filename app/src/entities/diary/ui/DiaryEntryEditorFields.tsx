import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PlatformOS } from '@shared/lib/platform';
import { Button, TextArea, ToggleSwitch } from '@shared/ui';

import {
  DIARY_ENTRY_COMMENT_MAXIMUM_LENGTH,
  DIARY_ENTRY_METRIC_MAXIMUM,
} from '../model/diaryEntryConstraints';
import type { MealRelation } from '../model/mealRelation';
import * as s from '../styles/DiaryEntryEditorFields';

import { DiaryEntryAiControl } from './DiaryEntryAiControl';
import { DiaryEntryDateTimeFields } from './DiaryEntryDateTimeFields';
import { DiaryEntryPhotoField } from './DiaryEntryPhotoField';
import { DiaryMealRelationSelect } from './DiaryMealRelationSelect';
import type { DiaryMetricKey } from './DiaryMetricIcon';
import { DiaryMetricStepper } from './DiaryMetricStepper';

type DiaryEntryEditorFieldsProps = {
  eventAt: Date;

  useCurrentDateTime: boolean;

  glucose: number | null;
  carbsGram: number | null;
  shortInsulin: number | null;
  ultraShortInsulin: number | null;
  longInsulin: number | null;

  mealRelation: MealRelation | null;

  comment: string;

  photoUri: string | null;
  isPhotoBusy?: boolean;

  requestAi?: boolean;
  canRequestAi?: boolean;

  requestTimer?: boolean;
  canRequestTimer?: boolean;

  aiAnalysis?: string | null;

  disabled?: boolean;

  onCurrentDateTimeChange: (value: boolean) => void;

  onEventDateChange: (value: Date) => void;
  onEventTimeChange: (value: Date) => void;

  onGlucoseChange: (value: number | null) => void;
  onCarbsGramChange: (value: number | null) => void;
  onShortInsulinChange: (value: number | null) => void;
  onUltraShortInsulinChange: (value: number | null) => void;
  onLongInsulinChange: (value: number | null) => void;

  onMealRelationChange: (value: MealRelation | null) => void;

  onCommentChange: (value: string) => void;

  onChoosePhoto: () => void;
  onDeletePhoto: () => void;

  onRequestAiChange?: (value: boolean) => void;
  onRequestTimerChange?: (value: boolean) => void;

  onDeleteAiAnalysis?: () => void;
};

type MetricField = {
  key: DiaryMetricKey;

  label: string;

  value: number | null;

  maximum: number;

  onChange: (value: number | null) => void;
};

export const DiaryEntryEditorFields = ({
  eventAt,
  useCurrentDateTime,
  glucose,
  carbsGram,
  shortInsulin,
  ultraShortInsulin,
  longInsulin,
  mealRelation,
  comment,
  photoUri,
  isPhotoBusy = false,
  requestAi = false,
  canRequestAi = false,
  requestTimer = false,
  canRequestTimer = false,
  aiAnalysis = null,
  disabled = false,
  onCurrentDateTimeChange,
  onEventDateChange,
  onEventTimeChange,
  onGlucoseChange,
  onCarbsGramChange,
  onShortInsulinChange,
  onUltraShortInsulinChange,
  onLongInsulinChange,
  onMealRelationChange,
  onCommentChange,
  onChoosePhoto,
  onDeletePhoto,
  onRequestAiChange,
  onRequestTimerChange,
  onDeleteAiAnalysis,
}: DiaryEntryEditorFieldsProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [metricsViewportWidth, setMetricsViewportWidth] = useState(0);

  const primaryMetricFields: MetricField[] = [
    {
      key: 'glucose',
      label: t('diary.entry.metrics.glucose'),
      value: glucose,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.glucose,
      onChange: onGlucoseChange,
    },
    {
      key: 'carbsGram',
      label: t('diary.entry.metrics.carbohydrates'),
      value: carbsGram,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.carbsGram,
      onChange: onCarbsGramChange,
    },
  ];

  const insulinMetricFields: MetricField[] = [
    {
      key: 'ultraShortInsulin',
      label: t('diary.entry.metrics.ultraShortInsulin'),
      value: ultraShortInsulin,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.ultraShortInsulin,
      onChange: onUltraShortInsulinChange,
    },
    {
      key: 'longInsulin',
      label: t('diary.entry.metrics.longInsulin'),
      value: longInsulin,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.longInsulin,
      onChange: onLongInsulinChange,
    },
    {
      key: 'shortInsulin',
      label: t('diary.entry.metrics.shortInsulin'),
      value: shortInsulin,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.shortInsulin,
      onChange: onShortInsulinChange,
    },
  ];

  const insulinMetricWidth = Math.max(
    0,
    (metricsViewportWidth - theme.spacing.sm) / 2
  );

  const hasAiAnalysis = aiAnalysis !== null && aiAnalysis.trim().length > 0;

  const showTimer = PlatformOS.ANDROID && onRequestTimerChange !== undefined;

  return (
    <s.Root>
      <DiaryEntryDateTimeFields
        eventAt={eventAt}
        useCurrentDateTime={useCurrentDateTime}
        disabled={disabled}
        dateAccessibilityLabel={t('diary.form.dateAccessibilityLabel')}
        timeAccessibilityLabel={t('diary.form.timeAccessibilityLabel')}
        currentDateTimeLabel={t('diary.form.useCurrentDateTime')}
        onCurrentDateTimeChange={onCurrentDateTimeChange}
        onDateChange={onEventDateChange}
        onTimeChange={onEventTimeChange}
      />

      <s.MetricRows>
        <s.Metrics>
          {primaryMetricFields.map((metric) => (
            <DiaryMetricStepper
              key={metric.key}
              metricKey={metric.key}
              label={metric.label}
              value={metric.value}
              maximum={metric.maximum}
              disabled={disabled}
              inputAccessibilityLabel={t(
                'diary.form.metric.valueAccessibilityLabel',
                {
                  metric: metric.label,
                }
              )}
              decrementAccessibilityLabel={t(
                'diary.form.metric.decreaseAccessibilityLabel',
                {
                  metric: metric.label,
                }
              )}
              incrementAccessibilityLabel={t(
                'diary.form.metric.increaseAccessibilityLabel',
                {
                  metric: metric.label,
                }
              )}
              onChange={metric.onChange}
            />
          ))}
        </s.Metrics>

        <s.InsulinScroll
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(event) => {
            setMetricsViewportWidth(event.nativeEvent.layout.width);
          }}
        >
          <s.InsulinMetrics>
            {insulinMetricFields.map((metric) => (
              <s.InsulinMetric key={metric.key} $width={insulinMetricWidth}>
                <DiaryMetricStepper
                  metricKey={metric.key}
                  label={metric.label}
                  value={metric.value}
                  maximum={metric.maximum}
                  disabled={disabled}
                  inputAccessibilityLabel={t(
                    'diary.form.metric.valueAccessibilityLabel',
                    {
                      metric: metric.label,
                    }
                  )}
                  decrementAccessibilityLabel={t(
                    'diary.form.metric.decreaseAccessibilityLabel',
                    {
                      metric: metric.label,
                    }
                  )}
                  incrementAccessibilityLabel={t(
                    'diary.form.metric.increaseAccessibilityLabel',
                    {
                      metric: metric.label,
                    }
                  )}
                  onChange={metric.onChange}
                />
              </s.InsulinMetric>
            ))}
          </s.InsulinMetrics>
        </s.InsulinScroll>
      </s.MetricRows>

      <s.MealPhotoRow>
        <s.MealRelationArea>
          <DiaryMealRelationSelect
            value={mealRelation}
            label={t('diary.form.mealRelation')}
            placeholder={t('diary.form.mealRelationPlaceholder')}
            noneLabel={t('diary.form.mealRelationNone')}
            disabled={disabled}
            onChange={onMealRelationChange}
          />
        </s.MealRelationArea>

        <s.PhotoArea>
          <DiaryEntryPhotoField
            photoUri={photoUri}
            disabled={disabled}
            isBusy={isPhotoBusy}
            onChoosePhoto={onChoosePhoto}
            onDeletePhoto={onDeletePhoto}
          />
        </s.PhotoArea>
      </s.MealPhotoRow>

      <s.CommentField $disabled={disabled}>
        <s.CommentHeader>
          <s.MetaIcon
            $backgroundColor={theme.colors.metrics.longInsulin.background}
            $borderColor={theme.colors.metrics.longInsulin.border}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={theme.size.lg}
              color={theme.colors.metrics.longInsulin.text}
            />
          </s.MetaIcon>

          <s.FieldLabel>{t('diary.entry.comment')}</s.FieldLabel>
        </s.CommentHeader>

        <TextArea
          value={comment}
          editable={!disabled}
          rejectResponderTermination={false}
          accessibilityLabel={t('diary.form.commentAccessibilityLabel')}
          placeholder={t('diary.form.commentPlaceholder')}
          maxLength={DIARY_ENTRY_COMMENT_MAXIMUM_LENGTH}
          onChangeText={onCommentChange}
          style={s.getCommentInputStyle(theme)}
        />
      </s.CommentField>

      {onRequestAiChange || showTimer ? (
        <s.ToggleRow>
          <s.ToggleCell>
            {onRequestAiChange ? (
              <DiaryEntryAiControl
                value={requestAi}
                disabled={!canRequestAi}
                onValueChange={onRequestAiChange}
              />
            ) : null}
          </s.ToggleCell>

          <s.ToggleCell>
            {showTimer ? (
              <ToggleSwitch
                icon="stopwatch-outline"
                iconColor={
                  canRequestTimer ? theme.colors.warning : theme.colors.muted
                }
                label={t('diary.form.timer.title')}
                value={requestTimer}
                disabled={!canRequestTimer}
                onValueChange={onRequestTimerChange}
              />
            ) : null}
          </s.ToggleCell>
        </s.ToggleRow>
      ) : null}

      {hasAiAnalysis && onDeleteAiAnalysis ? (
        <s.CommentField $disabled={disabled}>
          <s.CommentHeader>
            <s.MetaIcon
              $backgroundColor={theme.colors.shades.primary.sm}
              $borderColor={theme.colors.primary}
            >
              <Ionicons
                name="sparkles-outline"
                size={theme.size.lg}
                color={theme.colors.primary}
              />
            </s.MetaIcon>

            <s.FieldLabel>{t('diary.entry.aiAnalysis')}</s.FieldLabel>

            <Button
              tone="danger"
              disabled={disabled}
              accessibilityLabel={t('diary.selection.delete')}
              onPress={onDeleteAiAnalysis}
            >
              <s.DeleteAiButtonContent>
                <Ionicons
                  name="trash-outline"
                  size={theme.size.base}
                  color={theme.colors.danger}
                />

                <s.DeleteAiButtonText>
                  {t('diary.selection.delete')}
                </s.DeleteAiButtonText>
              </s.DeleteAiButtonContent>
            </Button>
          </s.CommentHeader>

          <s.AiAnalysisScroll nestedScrollEnabled showsVerticalScrollIndicator>
            <s.AiAnalysisText selectable>{aiAnalysis}</s.AiAnalysisText>
          </s.AiAnalysisScroll>
        </s.CommentField>
      ) : null}
    </s.Root>
  );
};
