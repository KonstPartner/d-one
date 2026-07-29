import { ReactElement } from 'react';
import { Theme } from '@emotion/react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';

import { PlatformOS } from '@features/shared/model';

export const AUTH_PATH = '/auth';
export const AUTH_CALLBACK_PATH = '/auth-callback';

export const DIARY_PATH = '/diary';
export const CLOUD_PATH = '/cloud';
export const PENDING_PATH = '/pending';
export const PROFILE_PATH = '/profile';

export const GUEST_PATHS = [AUTH_PATH, AUTH_CALLBACK_PATH] as const;

export const UNVERIFIED_PATHS = [AUTH_PATH, AUTH_CALLBACK_PATH] as const;

export const PENDING_PATHS = [PENDING_PATH, PROFILE_PATH] as const;

export const USER_PATHS = [DIARY_PATH, CLOUD_PATH, PROFILE_PATH] as const;

export const FOLLOWER_PATHS = [DIARY_PATH, PROFILE_PATH] as const;

export const headerScreen = ({
  title,
  theme,
  headerRight,
  backgroundColor = theme.colors.bg,
}: {
  title?: string;
  theme: Theme;
  headerRight?: () => ReactElement;
  backgroundColor?: string;
}) =>
  ({
    title,
    headerShown: true,
    headerTitleAlign: 'left',
    headerStyle: {
      backgroundColor,
    },
    headerTitleStyle: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
    },
    headerTintColor: theme.colors.text,
    headerShadowVisible: false,
    headerRight,
  }) as
    | ExtendedStackNavigationOptions
    | ((prop: {
        route: RouteProp<ParamListBase, string>;
        navigation: any;
      }) => ExtendedStackNavigationOptions)
    | undefined;

export const headerTabs = ({
  theme,
  headerRight,
}: {
  theme: Theme;
  headerRight?: () => ReactElement;
}) =>
  ({
    tabBarStyle: {
      backgroundColor: theme.colors.bg,
      elevation: 0,
      borderColor: 'transparent',
      ...(PlatformOS.WEB ? { height: 'auto' } : {}),
    },
    tabBarItemStyle: { paddingTop: 5 },
    tabBarActiveTintColor: theme.colors.text,
    tabBarInactiveTintColor: theme.colors.muted,

    headerShown: true,
    headerTitleAlign: 'left',
    headerStyle: { backgroundColor: theme.colors.bg },
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    headerShadowVisible: false,

    headerRight,
  }) as
    | BottomTabNavigationOptions
    | ((props: {
        route: import('@react-navigation/core').RouteProp<
          ParamListBase,
          string
        >;
        navigation: import('@react-navigation/bottom-tabs').BottomTabNavigationProp<
          ParamListBase,
          string,
          undefined
        >;
        theme: ReactNavigation.Theme;
      }) => BottomTabNavigationOptions)
    | undefined;
