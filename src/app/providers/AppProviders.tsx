import { StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

import { clearAuthSessionData } from '@features/auth/model';
import { HeaderMenuProvider } from '@features/header/model';
import { queryClient } from '@features/shared/api';
import { Notification } from '@features/shared/ui';
import { AppThemeProvider } from '@features/theme/model';
import { SessionProvider } from '@entities/session';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider onUnauthenticated={clearAuthSessionData}>
            <Host>
              <HeaderMenuProvider>{children}</HeaderMenuProvider>
            </Host>
          </SessionProvider>
        </QueryClientProvider>

        <Notification />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
