import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DiaryEntryEditorFields, DiaryEntryEditorModal } from '@entities/diary';
import { ConfirmDialog, PhotoRedactorModal } from '@shared/ui';

import {
  type CreateDiaryEntrySubmitResult,
  useCreateDiaryEntryForm,
} from '../model/useCreateDiaryEntryForm';

type CreateDiaryEntryModalProps = {
  visible: boolean;

  disabled?: boolean;

  onClose: () => void;

  onCreated: (result: CreateDiaryEntrySubmitResult) => void;
};

export const CreateDiaryEntryModal = ({
  visible,

  disabled = false,

  onClose,
  onCreated,
}: CreateDiaryEntryModalProps) => {
  const { t } = useTranslation();

  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);

  const {
    values,
    useCurrentDateTime,

    photoUri,
    photoEditorSource,
    hasTemporaryPhoto,

    isPhotoBusy,
    isSubmitting,

    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

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

    selectPhoto,
    deletePhoto,

    cancelPhotoEditing,
    confirmPhotoEditing,
    handlePhotoEditorError,

    discardPhoto,

    handleSubmit,
  } = useCreateDiaryEntryForm({
    visible,
  });

  const isBusy = isSubmitting || isPhotoBusy;

  const editorDisabled = disabled || isSubmitting;

  const handleRequestClose = () => {
    if (isBusy) {
      return;
    }

    if (!hasTemporaryPhoto) {
      onClose();

      return;
    }

    setDiscardConfirmVisible(true);
  };

  const handleCloseDiscardConfirm = () => {
    setDiscardConfirmVisible(false);
  };

  const handleConfirmDiscard = () => {
    if (!discardPhoto()) {
      return;
    }

    setDiscardConfirmVisible(false);

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
    if (disabled) {
      return;
    }

    const result = await handleSubmit();

    if (result === null) {
      return;
    }

    onCreated(result);
  };

  return (
    <>
      <DiaryEntryEditorModal
        visible={visible}
        title={t('diary.form.createTitle')}
        submitLabel={t(
          isSubmitting ? 'diary.form.creating' : 'diary.form.create'
        )}
        submitIcon="add"
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
        />
      </DiaryEntryEditorModal>

      <PhotoRedactorModal
        visible={photoEditorSource !== null}
        source={photoEditorSource}
        onCancel={cancelPhotoEditing}
        onConfirm={confirmPhotoEditing}
        onError={handlePhotoEditorError}
      />

      <ConfirmDialog
        visible={discardConfirmVisible}
        title={t('diary.form.photo.discardTitle')}
        description={t('diary.form.photo.discardMessage')}
        confirmLabel={t('diary.form.photo.discard')}
        confirmTone="danger"
        onConfirm={handleConfirmDiscard}
        onClose={handleCloseDiscardConfirm}
      />
    </>
  );
};
