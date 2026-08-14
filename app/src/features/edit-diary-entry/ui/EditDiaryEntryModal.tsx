import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntry,
  DiaryEntryEditorFields,
  DiaryEntryEditorModal,
} from '@entities/diary';

import {
  type EditDiaryEntrySubmitResult,
  useEditDiaryEntryForm,
} from '../model/useEditDiaryEntryForm';

type EditDiaryEntryModalProps = {
  visible: boolean;

  entry: DiaryEntry | null;

  disabled?: boolean;

  onClose: () => void;
  onUpdated: (result: EditDiaryEntrySubmitResult) => void;
};

export const EditDiaryEntryModal = ({
  visible,
  entry,
  disabled = false,
  onClose,
  onUpdated,
}: EditDiaryEntryModalProps) => {
  const { t } = useTranslation();

  const {
    values,
    useCurrentDateTime,

    photoUri,

    aiAnalysis,

    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

    isPhotoBusy,
    isSubmitting,

    handleGlucoseChange,
    handleCarbsGramChange,
    handleShortInsulinChange,
    handleLongInsulinChange,

    handleMealRelationChange,
    handleCommentChange,

    handleCurrentDateTimeChange,
    handleEventDateChange,
    handleEventTimeChange,

    handleRequestAiChange,
    handleRequestTimerChange,

    handleDeleteAiAnalysis,

    selectPhoto,
    deletePhoto,

    discardPhotoChanges,

    handleSubmit,
  } = useEditDiaryEntryForm({
    visible,
    entry,
    disabled,
  });

  const isBusy = isSubmitting || isPhotoBusy;

  const editorDisabled = disabled || isSubmitting;

  const handleRequestClose = () => {
    if (isBusy) {
      return;
    }

    if (!discardPhotoChanges()) {
      return;
    }

    onClose();
  };

  const handleChoosePhoto = () => {
    if (disabled || isBusy) {
      return;
    }

    Alert.alert(
      t('diary.form.photo.sourceTitle'),
      t('diary.form.photo.sourceMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('diary.form.photo.camera'),
          onPress: () => {
            void selectPhoto('camera');
          },
        },
        {
          text: t('diary.form.photo.gallery'),
          onPress: () => {
            void selectPhoto('library');
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const result = await handleSubmit();

    if (result === null) {
      return;
    }

    onUpdated(result);
  };

  if (!visible || entry === null || values === null) {
    return null;
  }

  return (
    <DiaryEntryEditorModal
      visible
      title={t('diary.form.editTitle')}
      submitLabel={t(isSubmitting ? 'diary.form.saving' : 'diary.form.save')}
      submitIcon="checkmark"
      disabled={disabled}
      isSubmitting={isSubmitting}
      isBusy={isBusy}
      onClose={handleRequestClose}
      onSubmit={() => {
        void handleSave();
      }}
    >
      <DiaryEntryEditorFields
        eventAt={values.eventAt}
        useCurrentDateTime={useCurrentDateTime}
        glucose={values.glucose}
        carbsGram={values.carbsGram}
        shortInsulin={values.shortInsulin}
        longInsulin={values.longInsulin}
        mealRelation={values.mealRelation}
        comment={values.comment}
        photoUri={photoUri}
        isPhotoBusy={isPhotoBusy}
        requestAi={requestAi}
        canRequestAi={canRequestAi}
        requestTimer={requestTimer}
        canRequestTimer={canRequestTimer}
        aiAnalysis={aiAnalysis}
        disabled={editorDisabled}
        onCurrentDateTimeChange={handleCurrentDateTimeChange}
        onEventDateChange={handleEventDateChange}
        onEventTimeChange={handleEventTimeChange}
        onGlucoseChange={handleGlucoseChange}
        onCarbsGramChange={handleCarbsGramChange}
        onShortInsulinChange={handleShortInsulinChange}
        onLongInsulinChange={handleLongInsulinChange}
        onMealRelationChange={handleMealRelationChange}
        onCommentChange={handleCommentChange}
        onChoosePhoto={handleChoosePhoto}
        onDeletePhoto={deletePhoto}
        onRequestAiChange={handleRequestAiChange}
        onRequestTimerChange={handleRequestTimerChange}
        onDeleteAiAnalysis={handleDeleteAiAnalysis}
      />
    </DiaryEntryEditorModal>
  );
};
