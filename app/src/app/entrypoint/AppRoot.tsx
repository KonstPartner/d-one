import { useEffect, useState } from 'react';
import { Fontisto } from '@expo/vector-icons';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useFonts } from 'expo-font';
import * as WebBrowser from 'expo-web-browser';

import { validateEnvConfig } from '@shared/config';
import { initI18n } from '@shared/i18n';
import { startNetworkListener } from '@shared/lib/network';
import { PlatformOS } from '@shared/lib/platform';

import { AppProviders } from '../providers';
import { AppGuard, RootStack } from '../routes';

export const AppRoot = () => {
  WebBrowser.maybeCompleteAuthSession();

  const [ready, setReady] = useState(false);

  const [spinnerFontLoaded, spinnerFontError] = useFonts(Fontisto.font);

  useEffect(() => {
    initI18n().finally(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    return startNetworkListener();
  }, []);

  validateEnvConfig();

  const spinnerFontReady = spinnerFontLoaded || spinnerFontError !== null;

  if (!ready || !spinnerFontReady) {
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
