import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as WebBrowser from 'expo-web-browser';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

import Routs from '@entities/layout/ui/Routs';
import { AuthProvider } from '@features/auth/model';
import { HeaderMenuProvider } from '@features/header/model';
import { initI18n } from '@features/i18n/model';
import { queryClient } from '@features/shared/api';
import { PlatformOS } from '@features/shared/model';
import { Notification } from '@features/shared/ui';
import { AppThemeProvider } from '@features/theme/model';

const RootLayout = () => {
  WebBrowser.maybeCompleteAuthSession();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Host>
              <HeaderMenuProvider>
                <Routs />
                {PlatformOS.WEB && <ReactQueryDevtools initialIsOpen={false} />}
              </HeaderMenuProvider>
            </Host>
          </AuthProvider>
        </QueryClientProvider>

        <Notification />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
