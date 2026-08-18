import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useIsMutating, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { DiaryTransferModal } from '@widgets/diary-transfer';
import { ChangePasswordForm } from '@features/auth/change-password';
import { LogoutButton } from '@features/auth/logout';
import { UpdateEmailForm } from '@features/auth/update-email';
import { ProfileHelp } from '@features/screen-help';
import { sessionMutationKeys, useSession } from '@entities/session';
import { userProfileQueryOptions, UserRole } from '@entities/user';
import { PlatformOS } from '@shared/lib/platform';
import { Loader, LoadingView, PageLayout, PortalModal } from '@shared/ui';

import * as s from '../styles/ProfilePage';

import { ProfileRelationsRow } from './ProfileRelationsRow';

const ProfileContent = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { sessionUser, isSessionReady } = useSession();

  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);

  const activeSessionMutations = useIsMutating({
    mutationKey: sessionMutationKeys.root,
  });

  const isSessionMutating = activeSessionMutations > 0;

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null && !isSessionMutating,
  });

  const isLoading =
    !isSessionReady ||
    isSessionMutating ||
    (sessionUser !== null && profileQuery.isPending);

  if (profileQuery.error && !isSessionMutating) {
    throw profileQuery.error;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  const profile = profileQuery.data;

  if (!profile) {
    return null;
  }

  const currentEmail = sessionUser?.email?.trim() || profile.email;

  const roleKey =
    profile.role === UserRole.User
      ? 'auth.profile.roles.user'
      : profile.role === UserRole.Follower
        ? 'auth.profile.roles.follower'
        : 'auth.profile.roles.pending';

  const hasGrantedRole =
    profile.role === UserRole.User || profile.role === UserRole.Follower;

  const roleBadgeTone = hasGrantedRole ? 'primary' : 'warning';

  const transferAvailable = profile.role === UserRole.User && !PlatformOS.WEB;

  return (
    <>
      <ProfileHelp role={profile.role} />

      <s.Scroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContentStyle}
      >
        <s.Content>
          <s.MainContent>
            <s.ProfileCard>
              <s.ProfileRow>
                <s.ProfileLabel>{t('auth.profile.nickname')}</s.ProfileLabel>

                <s.ProfileValue numberOfLines={1}>
                  {profile.nickname}
                </s.ProfileValue>
              </s.ProfileRow>

              <s.Separator />

              <s.ProfileRow>
                <s.ProfileLabel>{t('auth.profile.email.title')}</s.ProfileLabel>

                <s.ProfileValue numberOfLines={1}>
                  {currentEmail}
                </s.ProfileValue>
              </s.ProfileRow>

              <s.Separator />

              <s.ProfileRow>
                <s.ProfileLabel>{t('auth.profile.role')}</s.ProfileLabel>

                <s.RoleValue>
                  <s.ProfileBadge
                    style={s.getProfileBadgeStyle(theme, roleBadgeTone)}
                  >
                    <s.ProfileBadgeText
                      style={s.getProfileBadgeTextStyle(theme, roleBadgeTone)}
                    >
                      {t(roleKey)}
                    </s.ProfileBadgeText>
                  </s.ProfileBadge>
                </s.RoleValue>
              </s.ProfileRow>

              {hasGrantedRole && (
                <>
                  <s.Separator />

                  <ProfileRelationsRow profile={profile} />
                </>
              )}
            </s.ProfileCard>

            <s.Actions>
              <s.ActionButton
                accessibilityRole="button"
                onPress={() => {
                  setIsEmailModalVisible(true);
                }}
                style={s.getActionButtonStyle}
              >
                <s.ActionContent>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={theme.colors.text}
                  />

                  <s.ActionText>
                    {t('auth.profile.buttons.changeEmail')}
                  </s.ActionText>
                </s.ActionContent>
              </s.ActionButton>

              <s.ActionButton
                accessibilityRole="button"
                onPress={() => {
                  setIsPasswordModalVisible(true);
                }}
                style={s.getActionButtonStyle}
              >
                <s.ActionContent>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.colors.text}
                  />

                  <s.ActionText>
                    {t('auth.profile.buttons.changePassword')}
                  </s.ActionText>
                </s.ActionContent>
              </s.ActionButton>

              {transferAvailable && (
                <s.TransferActionButton
                  accessibilityRole="button"
                  accessibilityLabel={t('transfer.title')}
                  onPress={() => {
                    setIsTransferModalVisible(true);
                  }}
                  style={s.getActionButtonStyle}
                >
                  <s.ActionContent>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color={theme.colors.shades.warning.text}
                    />

                    <s.TransferActionText>
                      {t('transfer.title')}
                    </s.TransferActionText>
                  </s.ActionContent>
                </s.TransferActionButton>
              )}
            </s.Actions>
          </s.MainContent>

          <LogoutButton />
        </s.Content>
      </s.Scroll>

      <PortalModal
        visible={isEmailModalVisible}
        onClose={() => {
          setIsEmailModalVisible(false);
        }}
      >
        <UpdateEmailForm />
      </PortalModal>

      <PortalModal
        visible={isPasswordModalVisible}
        onClose={() => {
          setIsPasswordModalVisible(false);
        }}
      >
        <ChangePasswordForm />
      </PortalModal>

      {transferAvailable && (
        <DiaryTransferModal
          visible={isTransferModalVisible}
          onClose={() => {
            setIsTransferModalVisible(false);
          }}
        />
      )}
    </>
  );
};

export const ProfilePage = () => {
  return (
    <PageLayout>
      <Loader errorType="firebase">
        <ProfileContent />
      </Loader>
    </PageLayout>
  );
};
