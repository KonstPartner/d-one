import { useEffect, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as WebBrowser from 'expo-web-browser';

import { startNetworkListener } from '@features/network/model';
import { PlatformOS } from '@features/shared/model';
import { initI18n } from '@shared/i18n';

import { AppProviders } from '../providers';
import { AppGuard, RootStack } from '../routes';

export const AppRoot = () => {
  WebBrowser.maybeCompleteAuthSession();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    return startNetworkListener();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <AppGuard>
        <RootStack />

        {PlatformOS.WEB && <ReactQueryDevtools initialIsOpen={false} />}
      </AppGuard>
    </AppProviders>
  );
};
