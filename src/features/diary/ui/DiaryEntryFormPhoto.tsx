import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import Button from '@entities/shared/ui/Button';
import * as globalStyles from '@features/shared/styles/global';

import * as styles from '../styles/DiaryEntryFormPhoto';

type DiaryEntryFormPhotoProps = {
  photoUri: string | null;
  disabled: boolean;
  isBusy: boolean;
  onChoosePhoto: () => void;
  onDeletePhoto: () => void;
};

const DiaryEntryFormPhoto = ({
  photoUri,
  disabled,
  isBusy,
  onChoosePhoto,
  onDeletePhoto,
}: DiaryEntryFormPhotoProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const interactionDisabled = disabled || isBusy;
  const hasPhoto = photoUri !== null;

  return (
    <View style={styles.Root(theme, disabled)}>
      <Text style={globalStyles.Subheading(theme)}>
        {t('diary.form.photo.title')}
      </Text>

      <View style={styles.Preview(theme)}>
        {photoUri !== null ? (
          <Image
            source={photoUri}
            style={styles.Image}
            contentFit="cover"
            cachePolicy="none"
            recyclingKey={photoUri}
            accessible
            accessibilityLabel={t('diary.form.photo.previewAccessibilityLabel')}
          />
        ) : (
          <View style={styles.EmptyState(theme)}>
            <Ionicons
              name="image-outline"
              size={theme.size.xl}
              color={theme.colors.muted}
            />

            <Text style={globalStyles.Caption(theme)}>
              {t('diary.form.photo.empty')}
            </Text>
          </View>
        )}

        {isBusy ? (
          <View style={styles.LoadingOverlay(theme)}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
      </View>

      <View style={styles.Actions(theme)}>
        <Button
          accessibilityRole="button"
          accessibilityLabel={t(
            hasPhoto
              ? 'diary.form.photo.replaceAccessibilityLabel'
              : 'diary.form.photo.addAccessibilityLabel'
          )}
          disabled={interactionDisabled}
          onPress={onChoosePhoto}
          style={[
            styles.Action,
            globalStyles.Button(theme, 'secondary', interactionDisabled),
          ]}
        >
          <View style={styles.ButtonContent(theme)}>
            <Ionicons
              name={hasPhoto ? 'swap-horizontal-outline' : 'camera-outline'}
              size={theme.size.md}
              color={
                interactionDisabled ? theme.colors.muted : theme.colors.text
              }
            />

            <Text
              style={globalStyles.ButtonText(
                theme,
                'secondary',
                interactionDisabled
              )}
            >
              {t(
                hasPhoto ? 'diary.form.photo.replace' : 'diary.form.photo.add'
              )}
            </Text>
          </View>
        </Button>

        {hasPhoto ? (
          <Button
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.photo.deleteAccessibilityLabel')}
            disabled={interactionDisabled}
            onPress={onDeletePhoto}
            style={[
              styles.Action,
              globalStyles.Button(theme, 'danger', interactionDisabled),
            ]}
          >
            <View style={styles.ButtonContent(theme)}>
              <Ionicons
                name="trash-outline"
                size={theme.size.md}
                color={
                  interactionDisabled
                    ? theme.colors.shades.danger.text
                    : theme.colors.white
                }
              />

              <Text
                style={globalStyles.ButtonText(
                  theme,
                  'danger',
                  interactionDisabled
                )}
              >
                {t('diary.form.photo.delete')}
              </Text>
            </View>
          </Button>
        ) : null}
      </View>
    </View>
  );
};

export default DiaryEntryFormPhoto;
