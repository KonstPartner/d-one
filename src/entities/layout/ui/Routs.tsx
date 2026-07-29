import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderMenu } from '@features/header/ui';
import { headerScreen } from '@features/layout/model';

const Routs = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        style={{
          flex: 1,
          maxWidth: 500,
          minWidth: 320,
          width: '100%',
          margin: 'auto',
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="auth"
            options={headerScreen({
              title: t('layout.titles.login'),
              theme,
              headerRight: () => <HeaderMenu color="white" />,
              backgroundColor: theme.colors.primary,
            })}
          />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </View>
  );
};

export default Routs;
