import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { UserRole } from '@features/auth/model';
import type { DiaryEntry } from '@features/diary/model';
import * as styles from '@features/diary/styles/Diary';
import {
  DiaryEntryCard,
  DiaryPhotoViewer,
  LocalDiaryContent,
} from '@features/diary/ui';
import { PlatformOS } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

const Diary = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authData, isAuthLoading } = useAuthData();

  const [openedPhotoEntry, setOpenedPhotoEntry] = useState<DiaryEntry | null>(
    null
  );

  const isOwner = authData?.role === UserRole.User;
  const isOwnerWeb = PlatformOS.WEB && isOwner;

  const handleOpenPhoto = useCallback((entry: DiaryEntry) => {
    setOpenedPhotoEntry(entry);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setOpenedPhotoEntry(null);
  }, []);

  const renderLocalEntry = useCallback(
    (entry: DiaryEntry, isVisible: boolean) => (
      <DiaryEntryCard
        entry={entry}
        isVisible={isVisible}
        onOpenPhoto={handleOpenPhoto}
      />
    ),
    [handleOpenPhoto]
  );

  return (
    <PageWrapper>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="none">
          {isOwnerWeb ? (
            <View style={styles.UnsupportedContent(theme)}>
              <Text style={[globalStyles.Heading(theme), styles.CenteredText]}>
                {t('diary.unsupportedPlatform.title')}
              </Text>

              <Text style={[globalStyles.Body(theme), styles.CenteredText]}>
                {t('diary.unsupportedPlatform.description')}
              </Text>
            </View>
          ) : isOwner ? (
            <>
              <LocalDiaryContent renderEntry={renderLocalEntry} />

              <DiaryPhotoViewer
                entry={openedPhotoEntry}
                onClose={handleClosePhoto}
              />
            </>
          ) : (
            <View>
              <Text style={globalStyles.Body(theme)}>Diary</Text>
            </View>
          )}
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Diary;
