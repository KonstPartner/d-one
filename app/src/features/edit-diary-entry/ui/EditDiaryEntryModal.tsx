import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntry,
  DiaryEntryEditorFields,
  DiaryEntryEditorModal,
} from '@entities/diary';
import { ConfirmDialog, PhotoRedactorModal } from '@shared/ui';

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

  const [photoActionsVisible, setPhotoActionsVisible] = useState(false);

  const {
    values,
    useCurrentDateTime,

    photoUri,
    photoEditorSource,

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
    handleUltraShortInsulinChange,
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

    cancelPhotoEditing,
    confirmPhotoEditing,
    handlePhotoEditorError,

    discardPhotoChanges,

    handleSubmit,
  } = useEditDiaryEntryForm({
    visible,
    entry,
    disabled,
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

    if (!discardPhotoChanges()) {
      return;
    }

    onClose();
  };

  const handleChoosePhoto = () => {
    if (disabled || isBusy) {
      return;
    }

    setPhotoActionsVisible(true);
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
    <>
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
          ultraShortInsulin={values.ultraShortInsulin}
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
          onUltraShortInsulinChange={handleUltraShortInsulinChange}
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
    </>
  );
};
