import { ReactElement } from 'react';
import { Theme } from '@emotion/react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';

import { PlatformOS } from '@features/shared/model';

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
