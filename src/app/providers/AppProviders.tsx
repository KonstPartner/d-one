import { StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

import { HeaderMenuProvider } from '@widgets/header-menu';
import { Notification } from '@features/shared/ui';
import { SessionProvider } from '@entities/session';
import { removeLocalUserProfile, userProfileQueryKeys } from '@entities/user';
import { queryClient } from '@shared/api';

import { AppThemeProvider } from './theme/AppThemeProvider';

type AppProvidersProps = {
  children: ReactNode;
};

const clearSessionData = async (): Promise<void> => {
  await queryClient.cancelQueries({
    queryKey: userProfileQueryKeys.root,
  });

  queryClient.removeQueries({
    queryKey: userProfileQueryKeys.root,
  });

  await removeLocalUserProfile();
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider onUnauthenticated={clearSessionData}>
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
