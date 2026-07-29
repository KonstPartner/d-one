import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAuthData } from '@features/auth/api';
import { UserRole } from '@features/auth/model';
import { HeaderMenu } from '@features/header/ui';
import { headerTabs } from '@features/layout/model';

const TabsRoot = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authData } = useAuthData();

  const role = authData?.role ?? null;

  const isPending = role === null;
  const isUser = role === UserRole.User;
  const isFollower = role === UserRole.Follower;

  return (
    <Tabs
      screenOptions={headerTabs({
        theme,
        headerRight: () => <HeaderMenu />,
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
              name={focused ? 'hourglass' : 'hourglass-outline'}
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
  );
};

export default TabsRoot;
