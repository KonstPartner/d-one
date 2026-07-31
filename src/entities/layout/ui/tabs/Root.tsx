import { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ErrorSection, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { useAuth, UserRole } from '@features/auth/model';
import {
  DiaryDatabaseProvider,
  useDiaryDatabase,
} from '@features/diary/api/sqlite';
import { HeaderMenu } from '@features/header/ui';
import { headerTabs } from '@features/layout/model';
import { useNetwork } from '@features/network/model';
import { PlatformOS } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

const supportsLocalDiary = PlatformOS.ANDROID || PlatformOS.IOS;

const DiaryDatabaseBoundary = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { status, retry } = useDiaryDatabase();

  if (status === 'opening') {
    return <LoadingView loading />;
  }

  if (status === 'error') {
    return (
      <ErrorSection
        callback={retry}
        error={t('diary.database.initializationFailed')}
      />
    );
  }

  return <>{children}</>;
};

const TabsRoot = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authUser } = useAuth();
  const { authData } = useAuthData();
  const { status } = useNetwork();

  const role = authData?.role ?? null;

  const isPending = role === null;
  const isUser = role === UserRole.User;
  const isFollower = role === UserRole.Follower;

  const iconName: keyof typeof Ionicons.glyphMap =
    status === 'online'
      ? 'wifi'
      : status === 'offline'
        ? 'cloud-offline-outline'
        : 'help-circle-outline';

  const tabs = (
    <Tabs
      screenOptions={headerTabs({
        theme,
        headerRight: () => (
          <View
            style={globalStyles.ContainerFlex('row', 'center', 'center', 10)}
          >
            <Ionicons name={iconName} size={20} color={theme.colors.text} />
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
  );

  if (!isUser || !supportsLocalDiary) {
    return tabs;
  }

  if (authUser === null) {
    return <LoadingView loading />;
  }

  return (
    <DiaryDatabaseProvider userId={authUser.uid}>
      <DiaryDatabaseBoundary>{tabs}</DiaryDatabaseBoundary>
    </DiaryDatabaseProvider>
  );
};

export default TabsRoot;
