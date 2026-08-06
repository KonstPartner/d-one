import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuthData } from '@features/auth/api/hooks';
import { UserRole } from '@features/auth/model';
import * as styles from '@features/auth/styles/Profile';
import {
  ChangePasswordForm,
  LogoutButton,
  UpdateUserEmail,
} from '@features/auth/ui';
import { PortalModal } from '@features/shared/ui';
import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';

const Profile = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { authData, isAuthLoading } = useAuthData();

  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  if (!authData) {
    return null;
  }

  const roleKey =
    authData.role === UserRole.User
      ? 'auth.profile.roles.user'
      : authData.role === UserRole.Follower
        ? 'auth.profile.roles.follower'
        : 'auth.profile.roles.pending';

  const hasGrantedRole =
    authData.role === UserRole.User || authData.role === UserRole.Follower;

  return (
    <PageWrapper>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="firebase">
          <View style={styles.Content(theme)}>
            <View style={styles.ProfileCard(theme)}>
              <View style={styles.ProfileRow(theme)}>
                <Text style={styles.ProfileLabel(theme)}>
                  {t('auth.profile.nickname')}
                </Text>

                <Text style={styles.ProfileValue(theme)} numberOfLines={1}>
                  {authData.nickname}
                </Text>
              </View>

              <View style={styles.Separator(theme)} />

              <View style={styles.ProfileRow(theme)}>
                <Text style={styles.ProfileLabel(theme)}>
                  {t('auth.profile.email.title')}
                </Text>

                <Text style={styles.ProfileValue(theme)} numberOfLines={1}>
                  {authData.email}
                </Text>
              </View>

              <View style={styles.Separator(theme)} />

              <View style={styles.ProfileRow(theme)}>
                <Text style={styles.ProfileLabel(theme)}>
                  {t('auth.profile.role')}
                </Text>

                <View style={styles.RoleValue}>
                  <View style={styles.RoleBadge(theme, hasGrantedRole)}>
                    <Text style={styles.RoleBadgeText(theme, hasGrantedRole)}>
                      {t(roleKey)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.Actions(theme)}>
              <Pressable
                style={({ pressed }) => styles.ActionButton(theme, pressed)}
                onPress={() => setIsEmailModalVisible(true)}
                accessibilityRole="button"
              >
                <View style={styles.ActionContent(theme)}>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={theme.colors.text}
                  />

                  <Text style={styles.ActionText(theme)}>
                    {t('auth.profile.buttons.changeEmail')}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => styles.ActionButton(theme, pressed)}
                onPress={() => setIsPasswordModalVisible(true)}
                accessibilityRole="button"
              >
                <View style={styles.ActionContent(theme)}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.colors.text}
                  />

                  <Text style={styles.ActionText(theme)}>
                    {t('auth.profile.buttons.changePassword')}
                  </Text>
                </View>
              </Pressable>
            </View>

            <LogoutButton />
          </View>

          <PortalModal
            visible={isEmailModalVisible}
            onClose={() => setIsEmailModalVisible(false)}
          >
            <UpdateUserEmail />
          </PortalModal>

          <PortalModal
            visible={isPasswordModalVisible}
            onClose={() => setIsPasswordModalVisible(false)}
          >
            <ChangePasswordForm />
          </PortalModal>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Profile;
