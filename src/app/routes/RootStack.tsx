import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderMenu } from '@features/header/ui';

import { createStackScreenOptions } from './config/stackScreenOptions';

export const RootStack = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <RootContainer>
      <AppFrame>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />

          <Stack.Screen
            name="auth"
            options={createStackScreenOptions({
              theme,
              title: t('layout.titles.login'),
              backgroundColor: theme.colors.primary,

              headerRight: () => <HeaderMenu color={theme.colors.white} />,
            })}
          />

          <Stack.Screen name="auth-callback" />

          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppFrame>
    </RootContainer>
  );
};

const RootContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const AppFrame = styled.View`
  flex: 1;
  width: 100%;
  min-width: 320px;
  max-width: 500px;
  margin: auto;
`;
