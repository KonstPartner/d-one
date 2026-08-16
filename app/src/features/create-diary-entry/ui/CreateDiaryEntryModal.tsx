import { useEffect, useState } from 'react';
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

  const [photoActionsVisible, setPhotoActionsVisible] = useState(false);

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

  useEffect(() => {
    if (!visible) {
      setPhotoActionsVisible(false);
    }
  }, [visible]);

  const isBusy = isSubmitting || isPhotoBusy;

  const editorDisabled = disabled || isSubmitting;

  const handleRequestClose = () => {
    if (isBusy) {
      return;
    }

    setPhotoActionsVisible(false);

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

    setPhotoActionsVisible(true);
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

      <ConfirmDialog
        visible={photoActionsVisible}
        title={t('diary.form.photo.title')}
        actions={[
          ...(photoUri !== null
            ? [
                [
                  {
                    key: 'edit-selected',
                    label: t('diary.form.editSelected'),
                    icon: 'create-outline' as const,
                    onPress: () => {
                      void selectPhoto('selected');
                    },
                  },
                ],
              ]
            : []),

          [
            {
              key: 'camera',
              label: t('diary.form.photo.camera'),
              icon: 'camera-outline' as const,
              onPress: () => {
                void selectPhoto('camera');
              },
            },

            {
              key: 'gallery',
              label: t('diary.form.photo.gallery'),
              icon: 'images-outline' as const,
              onPress: () => {
                void selectPhoto('library');
              },
            },
          ],
        ]}
        onClose={() => {
          setPhotoActionsVisible(false);
        }}
      />

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
