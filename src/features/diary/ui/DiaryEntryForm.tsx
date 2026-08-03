import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import BigInput from '@entities/shared/ui/BigInput';
import Button from '@entities/shared/ui/Button';
import SelectDropdown from '@entities/shared/ui/SelectDropdown';
import type { SelectDropdownOption } from '@features/shared/model/types/dropdown';
import * as globalStyles from '@features/shared/styles/global';
import PortalModal from '@features/shared/ui/PortalModal';

import useDiaryEntryForm from '../model/hooks/useDiaryEntryForm';
import { MEAL_RELATION_PRESENTATION } from '../model/mealRelationPresentation';
import {
  type DiaryEntry,
  type DiaryEntryFormMode,
  MEAL_RELATIONS,
  type MealRelation,
} from '../model/types';
import * as styles from '../styles/DiaryEntryForm';

import DiaryEntryDateTimeFields from './DiaryEntryDateTimeFields';
import DiaryEntryFormPhoto from './DiaryEntryFormPhoto';
import MetricStepper from './MetricStepper';

type DiaryEntryFormProps = {
  visible: boolean;
  mode: DiaryEntryFormMode;
  entry: DiaryEntry | null;
  onClose: () => void;
  onSaved: (entryId: string) => void;
};

const GLUCOSE_MAXIMUM = 100;
const METRIC_MAXIMUM = 1000;

const DiaryEntryForm = ({
  visible,
  mode,
  entry,
  onClose,
  onSaved,
}: DiaryEntryFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    values,
    useCurrentDateTime,
    validationError,
    submissionError,
    isSubmitting,
    photoUri,
    photoError,
    hasTemporaryPhoto,
    isPhotoBusy,
    handleChoosePhoto,
    handleDeletePhoto,
    discardPhotoChanges,
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
  } = useDiaryEntryForm({
    visible,
    mode,
    entry,
    onSaved,
  });

  const mealRelationOptions = useMemo<
    SelectDropdownOption<MealRelation | null>[]
  >(
    () => [
      {
        key: 'none',
        value: null,
        label: t('diary.form.mealRelationNone'),
        icon: 'remove-circle-outline',
        tone: 'danger',
      },
      ...MEAL_RELATIONS.map((mealRelation) => ({
        key: mealRelation,
        value: mealRelation,
        label: t(`diary.entry.mealRelation.${mealRelation}`),
        ...MEAL_RELATION_PRESENTATION[mealRelation],
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
      : submissionError
        ? t(
            mode === 'create'
              ? 'diary.form.errors.creationFailed'
              : 'diary.form.errors.updateFailed'
          )
        : null;

  const isCreateMode = mode === 'create';
  const title = t(
    isCreateMode ? 'diary.form.createTitle' : 'diary.form.editTitle'
  );
  const submitLabel = t(
    isSubmitting
      ? isCreateMode
        ? 'diary.form.creating'
        : 'diary.form.saving'
      : isCreateMode
        ? 'diary.form.create'
        : 'diary.form.save'
  );

  const isBusy = isSubmitting || isPhotoBusy;

  const handleRequestClose = useCallback(() => {
    if (isBusy) {
      return;
    }

    const closeAfterDiscard = () => {
      if (discardPhotoChanges()) {
        onClose();
      }
    };

    if (!isCreateMode || !hasTemporaryPhoto) {
      closeAfterDiscard();

      return;
    }

    Alert.alert(
      t('diary.form.photo.discardTitle'),
      t('diary.form.photo.discardMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('diary.form.photo.discard'),
          style: 'destructive',
          onPress: closeAfterDiscard,
        },
      ]
    );
  }, [
    discardPhotoChanges,
    hasTemporaryPhoto,
    isBusy,
    isCreateMode,
    onClose,
    t,
  ]);

  const handleSave = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  return (
    <PortalModal
      visible={visible}
      onClose={handleRequestClose}
      withoutScroll
      withoutCloseBtn
      isDisabled={isBusy}
    >
      <View style={styles.Root}>
        <View style={styles.Header(theme)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.cancelAccessibilityLabel')}
            accessibilityState={{ disabled: isBusy }}
            disabled={isBusy}
            onPress={handleRequestClose}
            style={globalStyles.IconButton(theme, 'ghost', 'sm', isBusy)}
          >
            <Ionicons
              name="chevron-back"
              size={theme.size.md}
              color={isBusy ? theme.colors.muted : theme.colors.text}
            />
          </Pressable>

          <Text style={styles.Title(theme)}>{title}</Text>

          <View style={styles.HeaderSide(theme)} />
        </View>

        <ScrollView
          testID="diary-entry-form-scroll"
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
              metricKey="glucose"
              icon="water"
              label={glucoseLabel}
              value={values.glucose}
              maximum={GLUCOSE_MAXIMUM}
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
              onChange={handleGlucoseChange}
            />

            <MetricStepper
              metricKey="carbsGram"
              icon="leaf-outline"
              label={carbsLabel}
              value={values.carbsGram}
              maximum={METRIC_MAXIMUM}
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
              onChange={handleCarbsGramChange}
            />

            <MetricStepper
              metricKey="shortInsulin"
              icon="medical-outline"
              label={shortInsulinLabel}
              value={values.shortInsulin}
              maximum={METRIC_MAXIMUM}
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
              onChange={handleShortInsulinChange}
            />

            <MetricStepper
              metricKey="longInsulin"
              icon="shield-checkmark-outline"
              label={longInsulinLabel}
              value={values.longInsulin}
              maximum={METRIC_MAXIMUM}
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
              onChange={handleLongInsulinChange}
            />
          </View>

          <View
            pointerEvents={isSubmitting ? 'none' : 'auto'}
            accessibilityElementsHidden={isSubmitting}
            importantForAccessibility={
              isSubmitting ? 'no-hide-descendants' : 'auto'
            }
            style={styles.MetaField(theme, isSubmitting)}
          >
            <View
              style={[
                styles.MetaIcon(
                  theme,
                  theme.colors.shades.warning.sm,
                  theme.colors.shades.warning.lg
                ),
                styles.MealRelationIcon,
              ]}
            >
              <Ionicons
                name="restaurant-outline"
                size={theme.size.lg}
                color={theme.colors.warning}
              />
            </View>

            <View style={styles.MetaContent(theme)}>
              <Text style={globalStyles.Label(theme)}>
                {t('diary.form.mealRelation')}
              </Text>

              <SelectDropdown
                placeholder={t('diary.form.mealRelationPlaceholder')}
                selectedLabel={selectedMealRelationLabel}
                options={mealRelationOptions}
                inlineOptions
                isSelected={(option) => option.value === values.mealRelation}
                onSelect={handleMealRelationChange}
              />
            </View>
          </View>

          <View style={styles.CommentField(theme, isSubmitting)}>
            <View style={styles.CommentHeader(theme)}>
              <View
                style={styles.MetaIcon(
                  theme,
                  theme.colors.metrics.longInsulin.background,
                  theme.colors.metrics.longInsulin.border
                )}
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={theme.size.lg}
                  color={theme.colors.metrics.longInsulin.text}
                />
              </View>

              <Text style={globalStyles.Label(theme)}>
                {t('diary.entry.comment')}
              </Text>
            </View>

            <BigInput
              text={values.comment}
              setText={handleCommentChange}
              editable={!isSubmitting}
              rejectResponderTermination={false}
              accessibilityLabel={t('diary.form.commentAccessibilityLabel')}
              placeholder={t('diary.form.commentPlaceholder')}
              maxLength={5000}
              style={styles.CommentInput(theme)}
            />
          </View>

          <DiaryEntryFormPhoto
            photoUri={photoUri}
            errorCode={photoError}
            disabled={isSubmitting}
            isBusy={isPhotoBusy}
            onChoosePhoto={handleChoosePhoto}
            onDeletePhoto={handleDeletePhoto}
          />

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
            disabled={isBusy}
            onPress={handleRequestClose}
            style={[
              styles.Action,
              globalStyles.Button(theme, 'secondary', isBusy),
            ]}
          >
            <View style={styles.ButtonContent(theme)}>
              <Ionicons
                name="close"
                size={theme.size.md}
                color={isBusy ? theme.colors.muted : theme.colors.text}
              />

              <Text style={globalStyles.ButtonText(theme, 'secondary', isBusy)}>
                {t('diary.form.cancel')}
              </Text>
            </View>
          </Button>

          <Button
            accessibilityRole="button"
            accessibilityLabel={t(
              isCreateMode ? 'diary.form.create' : 'diary.form.save'
            )}
            disabled={isBusy}
            onPress={handleSave}
            style={[
              styles.Action,
              globalStyles.Button(theme, 'primary', isBusy),
            ]}
          >
            <View style={styles.ButtonContent(theme)}>
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.shades.primary.text}
                />
              ) : (
                <Ionicons
                  name={isCreateMode ? 'add' : 'checkmark'}
                  size={theme.size.md}
                  color={theme.colors.white}
                />
              )}

              <Text style={globalStyles.ButtonText(theme, 'primary', isBusy)}>
                {submitLabel}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </PortalModal>
  );
};

export default DiaryEntryForm;
