import type { Theme } from '@emotion/react';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { PlatformOS } from '@shared/lib/platform';

type CreateTabScreenOptionsParams = {
  theme: Theme;
  headerRight?: BottomTabNavigationOptions['headerRight'];
};

export const createTabScreenOptions = ({
  theme,
  headerRight,
}: CreateTabScreenOptionsParams): BottomTabNavigationOptions => {
  return {
    tabBarStyle: {
      backgroundColor: theme.colors.bg,
      elevation: 0,
      borderColor: 'transparent',
      ...(PlatformOS.WEB
        ? {
            height: 'auto',
          }
        : {}),
    },

    tabBarItemStyle: {
      paddingTop: 5,
    },

    tabBarActiveTintColor: theme.colors.text,
    tabBarInactiveTintColor: theme.colors.muted,

    headerShown: true,
    headerTitleAlign: 'left',

    headerStyle: {
      backgroundColor: theme.colors.bg,
    },

    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '700',
    },

    headerShadowVisible: false,
    headerRight,
  };
};
