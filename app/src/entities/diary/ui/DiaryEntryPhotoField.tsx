import { ActivityIndicator } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryEntryPhotoField';

type DiaryEntryPhotoFieldProps = {
  photoUri: string | null;

  disabled?: boolean;
  isBusy?: boolean;

  onChoosePhoto: () => void;
  onDeletePhoto: () => void;
};

export const DiaryEntryPhotoField = ({
  photoUri,
  disabled = false,
  isBusy = false,
  onChoosePhoto,
  onDeletePhoto,
}: DiaryEntryPhotoFieldProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const interactionDisabled = disabled || isBusy;

  const hasPhoto = photoUri !== null;

  return (
    <s.Root $disabled={disabled}>
      <s.Preview>
        {photoUri !== null && (
          <Image
            source={photoUri}
            style={s.imageStyle}
            contentFit="cover"
            cachePolicy="none"
            recyclingKey={photoUri}
            accessible
            accessibilityLabel={t('diary.form.photo.previewAccessibilityLabel')}
          />
        )}

        <s.EditButton
          disabled={interactionDisabled}
          accessibilityRole="button"
          accessibilityLabel={t(
            hasPhoto
              ? 'diary.form.photo.replaceAccessibilityLabel'
              : 'diary.form.photo.addAccessibilityLabel'
          )}
          onPress={onChoosePhoto}
        >
          <Ionicons
            name="pencil-outline"
            size={theme.size.lg}
            color={theme.colors.card}
          />
        </s.EditButton>

        {hasPhoto && (
          <s.DeleteButton
            disabled={interactionDisabled}
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.photo.deleteAccessibilityLabel')}
            onPress={onDeletePhoto}
          >
            <Ionicons
              name="trash-outline"
              size={theme.size.sm}
              color={theme.colors.card}
            />
          </s.DeleteButton>
        )}

        {isBusy && (
          <s.LoadingOverlay>
            <ActivityIndicator color={theme.colors.primary} />
          </s.LoadingOverlay>
        )}
      </s.Preview>
    </s.Root>
  );
};
