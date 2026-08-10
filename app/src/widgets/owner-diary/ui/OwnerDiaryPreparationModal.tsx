import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PortalModal, Spinner } from '@shared/ui';

import type { OwnerDiaryPreparationState } from '../model/useOwnerDiarySync';
import * as s from '../styles/OwnerDiaryPreparationModal';

type OwnerDiaryPreparationModalProps = {
  entry: OwnerDiaryPreparationState | null;
};

const ignoreClose = () => undefined;

export const OwnerDiaryPreparationModal = ({
  entry,
}: OwnerDiaryPreparationModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <PortalModal
      visible={entry !== null}
      onClose={ignoreClose}
      withoutScroll
      withoutCloseBtn
      isDisabled
    >
      <s.Content>
        <s.SavedCard>
          <s.SavedIcon>
            <Ionicons
              name="checkmark"
              size={theme.size.lg}
              color={theme.colors.success}
            />
          </s.SavedIcon>

          <s.SavedContent>
            <s.SavedTitle>{t('diary.form.preparation.saved')}</s.SavedTitle>

            <s.SavedDescription>
              {t('diary.form.preparation.savedLocally')}
            </s.SavedDescription>
          </s.SavedContent>
        </s.SavedCard>

        <s.UploadCard>
          <s.PhotoFrame>
            {entry?.photoUri ? (
              <s.Photo
                source={{
                  uri: entry.photoUri,
                }}
                contentFit="cover"
                cachePolicy="none"
              />
            ) : (
              <s.PhotoPlaceholder>
                <Ionicons
                  name="image-outline"
                  size={theme.size.xl}
                  color={theme.colors.muted}
                />
              </s.PhotoPlaceholder>
            )}
          </s.PhotoFrame>

          <s.UploadContent>
            <s.UploadTitle>
              {t('diary.form.preparation.uploadingPhoto')}
            </s.UploadTitle>

            <s.UploadDescription>
              {t('diary.form.preparation.finalizingPhoto')}
            </s.UploadDescription>
          </s.UploadContent>

          <s.LoaderBox>
            <Spinner size={22} color={theme.colors.primary} />
          </s.LoaderBox>
        </s.UploadCard>

        <s.FooterText>
          {t('diary.form.preparation.photoPreparing')}
        </s.FooterText>
      </s.Content>
    </PortalModal>
  );
};
