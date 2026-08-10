import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, PortalModal } from '@shared/ui';

import type { DiaryEntryEditableValues } from '../model/diaryEntryEditable';
import type { MealRelation } from '../model/mealRelation';
import * as s from '../styles/DiaryEntryEditorModal';

import { DiaryEntryEditorFields } from './DiaryEntryEditorFields';
import { DiaryEntryPhotoField } from './DiaryEntryPhotoField';

type DiaryEntryEditorModalProps = {
  visible: boolean;

  title: string;
  submitLabel: string;
  submitIcon: ComponentProps<typeof Ionicons>['name'];

  values: DiaryEntryEditableValues;
  useCurrentDateTime: boolean;

  photoUri: string | null;

  disabled?: boolean;
  isSubmitting?: boolean;
  isPhotoBusy?: boolean;

  onClose: () => void;
  onSubmit: () => void;

  onChoosePhoto: () => void;
  onDeletePhoto: () => void;

  onCurrentDateTimeChange: (value: boolean) => void;

  onEventDateChange: (value: Date) => void;
  onEventTimeChange: (value: Date) => void;

  onGlucoseChange: (value: number | null) => void;
  onCarbsGramChange: (value: number | null) => void;
  onShortInsulinChange: (value: number | null) => void;
  onLongInsulinChange: (value: number | null) => void;

  onMealRelationChange: (value: MealRelation | null) => void;

  onCommentChange: (value: string) => void;
};

export const DiaryEntryEditorModal = ({
  visible,
  title,
  submitLabel,
  submitIcon,
  values,
  useCurrentDateTime,
  photoUri,
  disabled = false,
  isSubmitting = false,
  isPhotoBusy = false,
  onClose,
  onSubmit,
  onChoosePhoto,
  onDeletePhoto,
  onCurrentDateTimeChange,
  onEventDateChange,
  onEventTimeChange,
  onGlucoseChange,
  onCarbsGramChange,
  onShortInsulinChange,
  onLongInsulinChange,
  onMealRelationChange,
  onCommentChange,
}: DiaryEntryEditorModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isBusy = isSubmitting || isPhotoBusy;

  const editorDisabled = disabled || isSubmitting;

  const submitDisabled = disabled || isBusy;

  return (
    <PortalModal
      visible={visible}
      onClose={onClose}
      withoutScroll
      withoutCloseBtn
      isDisabled={isBusy}
    >
      <s.Root>
        <s.Header>
          <Button
            tone="secondary"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.cancelAccessibilityLabel')}
            onPress={onClose}
            style={s.headerActionStyle}
          >
            <Ionicons
              name="chevron-back"
              size={theme.size.md}
              color={isBusy ? theme.colors.muted : theme.colors.text}
            />
          </Button>

          <s.Title>{title}</s.Title>

          <s.HeaderPlaceholder />
        </s.Header>

        <s.Scroll
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <s.Content>
            <DiaryEntryEditorFields
              eventAt={values.eventAt}
              useCurrentDateTime={useCurrentDateTime}
              glucose={values.glucose}
              carbsGram={values.carbsGram}
              shortInsulin={values.shortInsulin}
              longInsulin={values.longInsulin}
              mealRelation={values.mealRelation}
              comment={values.comment}
              disabled={editorDisabled}
              onCurrentDateTimeChange={onCurrentDateTimeChange}
              onEventDateChange={onEventDateChange}
              onEventTimeChange={onEventTimeChange}
              onGlucoseChange={onGlucoseChange}
              onCarbsGramChange={onCarbsGramChange}
              onShortInsulinChange={onShortInsulinChange}
              onLongInsulinChange={onLongInsulinChange}
              onMealRelationChange={onMealRelationChange}
              onCommentChange={onCommentChange}
            />

            <DiaryEntryPhotoField
              photoUri={photoUri}
              disabled={editorDisabled}
              isBusy={isPhotoBusy}
              onChoosePhoto={onChoosePhoto}
              onDeletePhoto={onDeletePhoto}
            />
          </s.Content>
        </s.Scroll>

        <s.Footer>
          <Button
            tone="secondary"
            variant="solid"
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.cancel')}
            onPress={onClose}
            style={s.actionStyle}
          >
            <s.ButtonContent>
              <Ionicons
                name="close"
                size={theme.size.md}
                color={isBusy ? theme.colors.muted : theme.colors.text}
              />

              <s.CancelText $disabled={isBusy}>
                {t('diary.form.cancel')}
              </s.CancelText>
            </s.ButtonContent>
          </Button>

          <Button
            tone="primary"
            variant="solid"
            loading={isSubmitting}
            disabled={submitDisabled}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            onPress={onSubmit}
            style={s.actionStyle}
          >
            <s.ButtonContent>
              <Ionicons
                name={submitIcon}
                size={theme.size.md}
                color={
                  submitDisabled
                    ? theme.colors.shades.primary.text
                    : theme.colors.white
                }
              />

              <s.SubmitText $disabled={submitDisabled}>
                {submitLabel}
              </s.SubmitText>
            </s.ButtonContent>
          </Button>
        </s.Footer>
      </s.Root>
    </PortalModal>
  );
};
