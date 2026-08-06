import { StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

import { AuthProvider } from '@features/auth/model';
import { HeaderMenuProvider } from '@features/header/model';
import { queryClient } from '@features/shared/api';
import { Notification } from '@features/shared/ui';
import { AppThemeProvider } from '@features/theme/model';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Host>
              <HeaderMenuProvider>{children}</HeaderMenuProvider>
            </Host>
          </AuthProvider>
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
