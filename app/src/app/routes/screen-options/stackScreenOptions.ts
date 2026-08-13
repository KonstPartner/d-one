import type { Theme } from '@emotion/react';
import { Stack } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';

type StackScreenOptions = NonNullable<
  ComponentProps<typeof Stack.Screen>['options']
>;

type CreateStackScreenOptionsParams = {
  theme: Theme;
  title?: string;
  backgroundColor?: string;
  headerRight?: () => ReactNode;
};

export const createStackScreenOptions = ({
  theme,
  title,
  headerRight,
  backgroundColor = theme.colors.bg,
}: CreateStackScreenOptionsParams): StackScreenOptions => {
  return {
    title,
    headerShown: true,
    headerTitleAlign: 'left',

    headerStyle: {
      backgroundColor,
    },

    headerTitleStyle: {
      color: theme.colors.white,
      fontSize: 18,
      fontWeight: '700',
    },

    headerTintColor: theme.colors.text,
    headerShadowVisible: false,
    headerRight,
  };
};
