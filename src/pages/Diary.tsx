import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { UserRole } from '@features/auth/model';
import type { DiaryEntry } from '@features/diary/model';
import useDiaryEntryFormController from '@features/diary/model/hooks/useDiaryEntryFormController';
import * as styles from '@features/diary/styles/Diary';
import {
  DiaryEntryCard,
  DiaryEntryForm,
  DiaryPhotoViewer,
  LocalDiaryContent,
} from '@features/diary/ui';
import { PlatformOS } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

const LocalDiaryOwnerContent = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [openedPhotoEntry, setOpenedPhotoEntry] = useState<DiaryEntry | null>(
    null
  );

  const {
    formState,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleEntrySaved,
  } = useDiaryEntryFormController();

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
        onPress={handleOpenEditForm}
        onOpenPhoto={handleOpenPhoto}
      />
    ),
    [handleOpenEditForm, handleOpenPhoto]
  );

  return (
    <View style={styles.OwnerContent}>
      <View style={styles.Toolbar(theme)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diary.form.openCreateAccessibilityLabel')}
          onPress={handleOpenCreateForm}
          style={styles.CreateButton(theme)}
        >
          <Ionicons
            name="add"
            size={theme.size.lg}
            color={theme.colors.white}
          />
        </Pressable>
      </View>

      <LocalDiaryContent renderEntry={renderLocalEntry} />

      <DiaryPhotoViewer entry={openedPhotoEntry} onClose={handleClosePhoto} />

      <DiaryEntryForm
        visible={formState.visible}
        mode={formState.mode}
        entry={formState.entry}
        onClose={handleCloseForm}
        onSaved={handleEntrySaved}
      />
    </View>
  );
};

const Diary = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authData, isAuthLoading } = useAuthData();

  const isOwner = authData?.role === UserRole.User;
  const isOwnerWeb = PlatformOS.WEB && isOwner;

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
            <LocalDiaryOwnerContent />
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
