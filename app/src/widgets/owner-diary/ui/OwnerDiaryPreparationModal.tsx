import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PortalModal, Spinner } from '@shared/ui';

import type { OwnerDiaryPreparationState } from '../model/useOwnerDiaryPreparation';
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

  const phase = entry?.phase ?? null;

  const isUploadingPhoto = phase === 'uploadingPhoto';
  const isAwaitingAiConsent = phase === 'awaitingAiConsent';
  const isAnalyzingAi = phase === 'analyzingAi';
  const isAnalysisReady = phase === 'analysisReady';

  const footerText = isUploadingPhoto
    ? t('diary.form.preparation.photoPreparing')
    : isAnalysisReady
      ? t('diaryAi.preparation.analysisSavedReturning')
      : t('diaryAi.preparation.preparing');

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
            <s.SavedTitle>
              {t('diary.form.preparation.savedLocally')}
            </s.SavedTitle>
          </s.SavedContent>
        </s.SavedCard>

        {isUploadingPhoto && (
          <s.StatusCard>
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

            <s.StatusContent>
              <s.StatusTitle>
                {t('diary.form.preparation.uploadingPhoto')}
              </s.StatusTitle>

              <s.StatusDescription>
                {t('diary.form.preparation.finalizingPhoto')}
              </s.StatusDescription>
            </s.StatusContent>

            <s.LoaderBox>
              <Spinner size={22} color={theme.colors.primary} />
            </s.LoaderBox>
          </s.StatusCard>
        )}

        {isAwaitingAiConsent && (
          <s.StatusCard>
            <s.StatusIconBox>
              <Ionicons
                name="shield-checkmark-outline"
                size={theme.size.xl}
                color={theme.colors.primary}
              />
            </s.StatusIconBox>

            <s.StatusContent>
              <s.StatusTitle>
                {t('diaryAi.preparation.awaitingConsent')}
              </s.StatusTitle>

              <s.StatusDescription>
                {t('diaryAi.consent.description')}
              </s.StatusDescription>
            </s.StatusContent>
          </s.StatusCard>
        )}

        {isAnalyzingAi && (
          <s.StatusCard>
            <s.StatusIconBox>
              <Ionicons
                name="sparkles-outline"
                size={theme.size.xl}
                color={theme.colors.primary}
              />
            </s.StatusIconBox>

            <s.StatusContent>
              <s.StatusTitle>
                {t('diaryAi.preparation.analyzing')}
              </s.StatusTitle>

              <s.StatusDescription>
                {t('diaryAi.preparation.analyzingDescription')}
              </s.StatusDescription>
            </s.StatusContent>

            <s.LoaderBox>
              <Spinner size={22} color={theme.colors.primary} />
            </s.LoaderBox>
          </s.StatusCard>
        )}

        {isAnalysisReady && entry?.aiAnalysis && (
          <s.ResultCard>
            <s.ResultHeader>
              <s.ResultIcon>
                <Ionicons
                  name="checkmark"
                  size={theme.size.lg}
                  color={theme.colors.success}
                />
              </s.ResultIcon>

              <s.ResultTitle>
                {t('diaryAi.preparation.analysisReady')}
              </s.ResultTitle>
            </s.ResultHeader>

            <s.ResultText>{entry.aiAnalysis}</s.ResultText>
          </s.ResultCard>
        )}

        <s.FooterText>{footerText}</s.FooterText>
      </s.Content>
    </PortalModal>
  );
};
