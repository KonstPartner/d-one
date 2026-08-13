import { type Theme, useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, TextArea } from '@shared/ui';

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
import { DiaryMetricStepper } from './DiaryMetricStepper';

type DiaryMetricKey = keyof Theme['colors']['metrics'];

type DiaryEntryEditorFieldsProps = {
  eventAt: Date;

  useCurrentDateTime: boolean;

  glucose: number | null;
  carbsGram: number | null;
  shortInsulin: number | null;
  longInsulin: number | null;

  mealRelation: MealRelation | null;

  comment: string;

  photoUri: string | null;
  isPhotoBusy?: boolean;

  requestAi?: boolean;
  canRequestAi?: boolean;

  aiAnalysis?: string | null;

  disabled?: boolean;

  onCurrentDateTimeChange: (value: boolean) => void;

  onEventDateChange: (value: Date) => void;
  onEventTimeChange: (value: Date) => void;

  onGlucoseChange: (value: number | null) => void;
  onCarbsGramChange: (value: number | null) => void;
  onShortInsulinChange: (value: number | null) => void;
  onLongInsulinChange: (value: number | null) => void;

  onMealRelationChange: (value: MealRelation | null) => void;

  onCommentChange: (value: string) => void;

  onChoosePhoto: () => void;
  onDeletePhoto: () => void;

  onRequestAiChange?: (value: boolean) => void;

  onDeleteAiAnalysis?: () => void;
};

type MetricField = {
  key: DiaryMetricKey;

  icon: ComponentProps<typeof Ionicons>['name'];

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
  longInsulin,
  mealRelation,
  comment,
  photoUri,
  isPhotoBusy = false,
  requestAi = false,
  canRequestAi = false,
  aiAnalysis = null,
  disabled = false,
  onCurrentDateTimeChange,
  onEventDateChange,
  onEventTimeChange,
  onGlucoseChange,
  onCarbsGramChange,
  onShortInsulinChange,
  onLongInsulinChange,
  onMealRelationChange,
  onCommentChange,
  onChoosePhoto,
  onDeletePhoto,
  onRequestAiChange,
  onDeleteAiAnalysis,
}: DiaryEntryEditorFieldsProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const metricFields: MetricField[] = [
    {
      key: 'glucose',
      icon: 'water',
      label: t('diary.entry.metrics.glucose'),
      value: glucose,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.glucose,
      onChange: onGlucoseChange,
    },
    {
      key: 'carbsGram',
      icon: 'leaf-outline',
      label: t('diary.entry.metrics.carbohydrates'),
      value: carbsGram,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.carbsGram,
      onChange: onCarbsGramChange,
    },
    {
      key: 'shortInsulin',
      icon: 'medical-outline',
      label: t('diary.entry.metrics.shortInsulin'),
      value: shortInsulin,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.shortInsulin,
      onChange: onShortInsulinChange,
    },
    {
      key: 'longInsulin',
      icon: 'shield-checkmark-outline',
      label: t('diary.entry.metrics.longInsulin'),
      value: longInsulin,
      maximum: DIARY_ENTRY_METRIC_MAXIMUM.longInsulin,
      onChange: onLongInsulinChange,
    },
  ];

  const hasAiAnalysis = aiAnalysis !== null && aiAnalysis.trim().length > 0;

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

      <s.Metrics>
        {metricFields.map((metric) => (
          <DiaryMetricStepper
            key={metric.key}
            metricKey={metric.key}
            icon={metric.icon}
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

      {onRequestAiChange ? (
        <s.ToggleRow>
          <s.ToggleCell>
            <DiaryEntryAiControl
              value={requestAi}
              disabled={!canRequestAi}
              onValueChange={onRequestAiChange}
            />
          </s.ToggleCell>

          <s.ToggleCell />
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
              variant="ghost"
              size="sm"
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
