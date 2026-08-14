import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderMenu } from '@widgets/header-menu';
import { useSession } from '@entities/session';
import { userProfileQueryOptions, UserRole } from '@entities/user';
import { useNetwork } from '@shared/lib/network';
import { Row } from '@shared/styles';

import { DiaryRuntimeBoundary } from '../providers/DiaryRuntimeBoundary';

import { createTabScreenOptions } from './screen-options/tabScreenOptions';

export const AppTabs = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { sessionUser } = useSession();

  const userId = sessionUser?.uid ?? null;

  const { data: profile } = useQuery(userProfileQueryOptions(userId));

  const { status: networkStatus } = useNetwork();

  const role = profile?.role ?? null;

  const isPending = role === null;
  const isUser = role === UserRole.User;

  const networkIconName: keyof typeof Ionicons.glyphMap =
    networkStatus === 'online'
      ? 'wifi'
      : networkStatus === 'offline'
        ? 'cloud-offline-outline'
        : 'help-circle-outline';

  return (
    <DiaryRuntimeBoundary enabled={isUser} userId={userId}>
      <Tabs
        screenOptions={createTabScreenOptions({
          theme,

          headerRight: () => (
            <View style={Row(theme, 'center', 'center', 'sm')}>
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

            href: isUser ? undefined : null,

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
