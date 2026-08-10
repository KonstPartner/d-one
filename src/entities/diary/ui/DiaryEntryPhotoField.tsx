import { ActivityIndicator } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';

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
      <s.Title>{t('diary.form.photo.title')}</s.Title>

      <s.Preview>
        {photoUri !== null ? (
          <Image
            source={photoUri}
            style={s.imageStyle}
            contentFit="cover"
            cachePolicy="none"
            recyclingKey={photoUri}
            accessible
            accessibilityLabel={t('diary.form.photo.previewAccessibilityLabel')}
          />
        ) : (
          <s.EmptyState>
            <Ionicons
              name="image-outline"
              size={theme.size.xl}
              color={theme.colors.muted}
            />

            <s.EmptyText>{t('diary.form.photo.empty')}</s.EmptyText>
          </s.EmptyState>
        )}

        {isBusy && (
          <s.LoadingOverlay>
            <ActivityIndicator color={theme.colors.primary} />
          </s.LoadingOverlay>
        )}
      </s.Preview>

      <s.Actions>
        <Button
          tone="secondary"
          variant="solid"
          disabled={interactionDisabled}
          accessibilityRole="button"
          accessibilityLabel={t(
            hasPhoto
              ? 'diary.form.photo.replaceAccessibilityLabel'
              : 'diary.form.photo.addAccessibilityLabel'
          )}
          onPress={onChoosePhoto}
          style={s.actionStyle}
        >
          <s.ButtonContent>
            <Ionicons
              name={hasPhoto ? 'swap-horizontal-outline' : 'camera-outline'}
              size={theme.size.md}
              color={
                interactionDisabled ? theme.colors.muted : theme.colors.text
              }
            />

            <s.SecondaryButtonText $disabled={interactionDisabled}>
              {t(
                hasPhoto ? 'diary.form.photo.replace' : 'diary.form.photo.add'
              )}
            </s.SecondaryButtonText>
          </s.ButtonContent>
        </Button>

        {hasPhoto && (
          <Button
            tone="danger"
            variant="solid"
            disabled={interactionDisabled}
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.photo.deleteAccessibilityLabel')}
            onPress={onDeletePhoto}
            style={s.actionStyle}
          >
            <s.ButtonContent>
              <Ionicons
                name="trash-outline"
                size={theme.size.md}
                color={
                  interactionDisabled ? theme.colors.muted : theme.colors.white
                }
              />

              <s.DangerButtonText $disabled={interactionDisabled}>
                {t('diary.form.photo.delete')}
              </s.DangerButtonText>
            </s.ButtonContent>
          </Button>
        )}
      </s.Actions>
    </s.Root>
  );
};
