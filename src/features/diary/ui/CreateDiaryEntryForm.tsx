import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import BigInput from '@entities/shared/ui/BigInput';
import Button from '@entities/shared/ui/Button';
import ConfirmModal from '@entities/shared/ui/ConfirmModal';
import SelectDropdown from '@entities/shared/ui/SelectDropdown';
import type { SelectDropdownOption } from '@features/shared/model/types/dropdown';
import * as globalStyles from '@features/shared/styles/global';
import PortalModal from '@features/shared/ui/PortalModal';

import useCreateDiaryEntryForm from '../model/hooks/useCreateDiaryEntryForm';
import { MEAL_RELATIONS, type MealRelation } from '../model/types';
import * as styles from '../styles/CreateDiaryEntryForm';

import DiaryEntryDateTimeFields from './DiaryEntryDateTimeFields';
import MetricStepper from './MetricStepper';

type CreateDiaryEntryFormProps = {
  onClose: () => void;
  onCreated: (entryId: string) => void;
};

const CreateDiaryEntryForm = ({
  onClose,
  onCreated,
}: CreateDiaryEntryFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [discardConfirmationVisible, setDiscardConfirmationVisible] =
    useState(false);

  const {
    values,
    useCurrentDateTime,
    isDirty,
    validationError,
    creationError,
    isSubmitting,
    handleGlucoseChange,
    handleMealRelationChange,
    handleShortInsulinChange,
    handleLongInsulinChange,
    handleCarbsGramChange,
    handleCommentChange,
    handleCurrentDateTimeChange,
    handleEventDateChange,
    handleEventTimeChange,
    handleSubmit,
  } = useCreateDiaryEntryForm({
    onCreated,
  });

  const mealRelationOptions = useMemo<
    SelectDropdownOption<MealRelation | null>[]
  >(
    () => [
      {
        key: 'none',
        value: null,
        label: t('diary.form.mealRelationNone'),
      },
      ...MEAL_RELATIONS.map((mealRelation) => ({
        key: mealRelation,
        value: mealRelation,
        label: t(`diary.entry.mealRelation.${mealRelation}`),
      })),
    ],
    [t]
  );

  const glucoseLabel = t('diary.entry.metrics.glucose');
  const carbsLabel = t('diary.entry.metrics.carbohydrates');
  const shortInsulinLabel = t('diary.entry.metrics.shortInsulin');
  const longInsulinLabel = t('diary.entry.metrics.longInsulin');

  const selectedMealRelationLabel =
    values.mealRelation === null
      ? null
      : t(`diary.entry.mealRelation.${values.mealRelation}`);

  const errorMessage =
    validationError !== null
      ? t(`diary.form.errors.${validationError}`)
      : creationError
        ? t('diary.form.errors.creationFailed')
        : null;

  const handleRequestClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      setDiscardConfirmationVisible(true);

      return;
    }

    onClose();
  }, [isDirty, isSubmitting, onClose]);

  const handleDiscardConfirmation = useCallback(() => {
    setDiscardConfirmationVisible(false);
    onClose();
  }, [onClose]);

  const handleCreate = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  return (
    <>
      <PortalModal
        visible
        onClose={handleRequestClose}
        withoutScroll
        withoutCloseBtn
        isDisabled={isSubmitting}
      >
        <View style={styles.Root}>
          <View style={styles.Header(theme)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('diary.form.cancelAccessibilityLabel')}
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              onPress={handleRequestClose}
              style={globalStyles.IconButton(
                theme,
                'ghost',
                'sm',
                isSubmitting
              )}
            >
              <Ionicons
                name="chevron-back"
                size={theme.size.md}
                color={isSubmitting ? theme.colors.muted : theme.colors.text}
              />
            </Pressable>

            <Text style={styles.Title(theme)}>
              {t('diary.form.createTitle')}
            </Text>

            <View style={styles.HeaderSide(theme)} />
          </View>

          <ScrollView
            style={styles.Scroll}
            contentContainerStyle={styles.Content(theme)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <DiaryEntryDateTimeFields
              eventAt={values.eventAt}
              useCurrentDateTime={useCurrentDateTime}
              disabled={isSubmitting}
              dateAccessibilityLabel={t('diary.form.dateAccessibilityLabel')}
              timeAccessibilityLabel={t('diary.form.timeAccessibilityLabel')}
              currentDateTimeLabel={t('diary.form.useCurrentDateTime')}
              onCurrentDateTimeChange={handleCurrentDateTimeChange}
              onDateChange={handleEventDateChange}
              onTimeChange={handleEventTimeChange}
            />

            <View style={styles.Metrics(theme)}>
              <MetricStepper
                label={glucoseLabel}
                value={values.glucose}
                disabled={isSubmitting}
                inputAccessibilityLabel={t(
                  'diary.form.metric.valueAccessibilityLabel',
                  {
                    metric: glucoseLabel,
                  }
                )}
                decrementAccessibilityLabel={t(
                  'diary.form.metric.decreaseAccessibilityLabel',
                  {
                    metric: glucoseLabel,
                  }
                )}
                incrementAccessibilityLabel={t(
                  'diary.form.metric.increaseAccessibilityLabel',
                  {
                    metric: glucoseLabel,
                  }
                )}
                clearAccessibilityLabel={t(
                  'diary.form.metric.clearAccessibilityLabel',
                  {
                    metric: glucoseLabel,
                  }
                )}
                onChange={handleGlucoseChange}
              />

              <MetricStepper
                label={carbsLabel}
                value={values.carbsGram}
                disabled={isSubmitting}
                inputAccessibilityLabel={t(
                  'diary.form.metric.valueAccessibilityLabel',
                  {
                    metric: carbsLabel,
                  }
                )}
                decrementAccessibilityLabel={t(
                  'diary.form.metric.decreaseAccessibilityLabel',
                  {
                    metric: carbsLabel,
                  }
                )}
                incrementAccessibilityLabel={t(
                  'diary.form.metric.increaseAccessibilityLabel',
                  {
                    metric: carbsLabel,
                  }
                )}
                clearAccessibilityLabel={t(
                  'diary.form.metric.clearAccessibilityLabel',
                  {
                    metric: carbsLabel,
                  }
                )}
                onChange={handleCarbsGramChange}
              />

              <MetricStepper
                label={shortInsulinLabel}
                value={values.shortInsulin}
                disabled={isSubmitting}
                inputAccessibilityLabel={t(
                  'diary.form.metric.valueAccessibilityLabel',
                  {
                    metric: shortInsulinLabel,
                  }
                )}
                decrementAccessibilityLabel={t(
                  'diary.form.metric.decreaseAccessibilityLabel',
                  {
                    metric: shortInsulinLabel,
                  }
                )}
                incrementAccessibilityLabel={t(
                  'diary.form.metric.increaseAccessibilityLabel',
                  {
                    metric: shortInsulinLabel,
                  }
                )}
                clearAccessibilityLabel={t(
                  'diary.form.metric.clearAccessibilityLabel',
                  {
                    metric: shortInsulinLabel,
                  }
                )}
                onChange={handleShortInsulinChange}
              />

              <MetricStepper
                label={longInsulinLabel}
                value={values.longInsulin}
                disabled={isSubmitting}
                inputAccessibilityLabel={t(
                  'diary.form.metric.valueAccessibilityLabel',
                  {
                    metric: longInsulinLabel,
                  }
                )}
                decrementAccessibilityLabel={t(
                  'diary.form.metric.decreaseAccessibilityLabel',
                  {
                    metric: longInsulinLabel,
                  }
                )}
                incrementAccessibilityLabel={t(
                  'diary.form.metric.increaseAccessibilityLabel',
                  {
                    metric: longInsulinLabel,
                  }
                )}
                clearAccessibilityLabel={t(
                  'diary.form.metric.clearAccessibilityLabel',
                  {
                    metric: longInsulinLabel,
                  }
                )}
                onChange={handleLongInsulinChange}
              />
            </View>

            <View
              pointerEvents={isSubmitting ? 'none' : 'auto'}
              accessibilityElementsHidden={isSubmitting}
              importantForAccessibility={
                isSubmitting ? 'no-hide-descendants' : 'auto'
              }
              style={styles.Dropdown(isSubmitting)}
            >
              <SelectDropdown
                label={t('diary.form.mealRelation')}
                placeholder={t('diary.form.mealRelationPlaceholder')}
                selectedLabel={selectedMealRelationLabel}
                options={mealRelationOptions}
                isSelected={(option) => option.value === values.mealRelation}
                onSelect={handleMealRelationChange}
              />
            </View>

            <View style={styles.Field(theme)}>
              <Text style={globalStyles.Label(theme)}>
                {t('diary.entry.comment')}
              </Text>

              <BigInput
                text={values.comment}
                setText={handleCommentChange}
                editable={!isSubmitting}
                accessibilityLabel={t('diary.form.commentAccessibilityLabel')}
                placeholder={t('diary.form.commentPlaceholder')}
                maxLength={5000}
                style={styles.CommentInput(theme)}
              />
            </View>

            {errorMessage !== null ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.ErrorText(theme)}
              >
                {errorMessage}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.Footer(theme)}>
            <Button
              accessibilityRole="button"
              accessibilityLabel={t('diary.form.cancel')}
              disabled={isSubmitting}
              onPress={handleRequestClose}
              style={[
                styles.Action,
                globalStyles.Button(theme, 'secondary', isSubmitting),
              ]}
            >
              <View style={styles.ButtonContent(theme)}>
                <Ionicons
                  name="close"
                  size={theme.size.md}
                  color={isSubmitting ? theme.colors.muted : theme.colors.text}
                />

                <Text style={globalStyles.ButtonText(theme, 'secondary')}>
                  {t('diary.form.cancel')}
                </Text>
              </View>
            </Button>

            <Button
              accessibilityRole="button"
              accessibilityLabel={t('diary.form.create')}
              disabled={isSubmitting}
              onPress={handleCreate}
              style={[
                styles.Action,
                globalStyles.Button(theme, 'primary', isSubmitting),
              ]}
            >
              <View style={styles.ButtonContent(theme)}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Ionicons
                    name="add"
                    size={theme.size.md}
                    color={theme.colors.white}
                  />
                )}

                <Text style={globalStyles.ButtonText(theme, 'primary')}>
                  {isSubmitting
                    ? t('diary.form.creating')
                    : t('diary.form.create')}
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </PortalModal>

      <ConfirmModal
        title={t('diary.form.discard.title')}
        description={t('diary.form.discard.description')}
        buttonText={t('diary.form.discard.confirm')}
        buttonStyle={globalStyles.Button(theme, 'danger')}
        modalVisible={discardConfirmationVisible}
        setModalVisible={setDiscardConfirmationVisible}
        handleConfirmation={handleDiscardConfirmation}
      />
    </>
  );
};

export default CreateDiaryEntryForm;
