import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAuthData } from '@features/auth/api';
import { useAuth, UserRole } from '@features/auth/model';
import { HeaderMenu } from '@features/header/ui';
import { useNetwork } from '@features/network/model';
import * as globalStyles from '@features/shared/styles/global';

import { DiaryRuntimeBoundary } from '../providers/DiaryRuntimeBoundary';

import { createTabScreenOptions } from './config/tabScreenOptions';

export const AppTabs = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { authUser } = useAuth();
  const { authData } = useAuthData();
  const { status: networkStatus } = useNetwork();

  const role = authData?.role ?? null;

  const isPending = role === null;
  const isUser = role === UserRole.User;
  const isFollower = role === UserRole.Follower;

  const networkIconName: keyof typeof Ionicons.glyphMap =
    networkStatus === 'online'
      ? 'wifi'
      : networkStatus === 'offline'
        ? 'cloud-offline-outline'
        : 'help-circle-outline';

  return (
    <DiaryRuntimeBoundary enabled={isUser} userId={authUser?.uid ?? null}>
      <Tabs
        screenOptions={createTabScreenOptions({
          theme,

          headerRight: () => (
            <View
              style={globalStyles.ContainerFlex('row', 'center', 'center', 10)}
            >
              <Ionicons
                name={networkIconName}
                size={20}
                color={theme.colors.text}
              />

              <HeaderMenu />
            </View>
          ),
        })}
      >
        <Tabs.Screen
          name="diary"
          options={{
            title: t('layout.tabs.diary'),
            href: isUser || isFollower ? undefined : null,

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="cloud"
          options={{
            title: t('layout.tabs.cloud'),
            href: isUser ? undefined : null,

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'cloud' : 'cloud-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="pending"
          options={{
            title: t('layout.tabs.pending'),
            href: isPending ? undefined : null,

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t('layout.tabs.profile'),

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </DiaryRuntimeBoundary>
  );
};
