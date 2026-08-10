import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DiaryEntryEditorModal } from '@entities/diary';
import { ConfirmDialog } from '@shared/ui';

import { useCreateDiaryEntryForm } from '../model/useCreateDiaryEntryForm';

type CreateDiaryEntryModalProps = {
  visible: boolean;

  onClose: () => void;

  onCreated: (entryId: string) => void;
};

export const CreateDiaryEntryModal = ({
  visible,
  onClose,
  onCreated,
}: CreateDiaryEntryModalProps) => {
  const { t } = useTranslation();

  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);

  const {
    values,
    useCurrentDateTime,

    photoUri,
    hasTemporaryPhoto,

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

    selectPhoto,
    deletePhoto,

    discardPhoto,

    handleSubmit,
  } = useCreateDiaryEntryForm({
    visible,
  });

  const isBusy = isSubmitting || isPhotoBusy;

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
    if (isBusy) {
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
    const entryId = await handleSubmit();

    if (entryId === null) {
      return;
    }

    onCreated(entryId);
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
        values={values}
        useCurrentDateTime={useCurrentDateTime}
        photoUri={photoUri}
        isSubmitting={isSubmitting}
        isPhotoBusy={isPhotoBusy}
        onClose={handleRequestClose}
        onSubmit={() => {
          void handleSave();
        }}
        onChoosePhoto={handleChoosePhoto}
        onDeletePhoto={deletePhoto}
        onCurrentDateTimeChange={handleCurrentDateTimeChange}
        onEventDateChange={handleEventDateChange}
        onEventTimeChange={handleEventTimeChange}
        onGlucoseChange={handleGlucoseChange}
        onCarbsGramChange={handleCarbsGramChange}
        onShortInsulinChange={handleShortInsulinChange}
        onLongInsulinChange={handleLongInsulinChange}
        onMealRelationChange={handleMealRelationChange}
        onCommentChange={handleCommentChange}
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
