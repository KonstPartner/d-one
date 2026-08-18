import { getApp } from '@react-native-firebase/app';
import {
  type AppCheck,
  getToken,
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';

import { envConfig } from '@shared/config';

let appCheckPromise: Promise<AppCheck> | null = null;

const getAndroidAppCheckOptions = () => {
  if (__DEV__) {
    return {
      provider: 'debug' as const,
    };
  }

  if (envConfig.appCheckAndroidProvider === 'debug') {
    if (!envConfig.appCheckAndroidDebugToken) {
      throw new Error('APP_CHECK_DEBUG_TOKEN_MISSING');
    }

    return {
      provider: 'debug' as const,
      debugToken: envConfig.appCheckAndroidDebugToken,
    };
  }

  return {
    provider: 'playIntegrity' as const,
  };
};

const initializeFirebaseAppCheck = async (): Promise<AppCheck> => {
  const provider = new ReactNativeFirebaseAppCheckProvider();

  provider.configure({
    android: getAndroidAppCheckOptions(),

    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    },
  });

  return initializeAppCheck(getApp(), {
    provider,
    isTokenAutoRefreshEnabled: false,
  });
};

const getFirebaseAppCheck = (): Promise<AppCheck> => {
  if (appCheckPromise === null) {
    appCheckPromise = initializeFirebaseAppCheck();
  }

  return appCheckPromise;
};

export const getFirebaseAppCheckToken = async (): Promise<string> => {
  const appCheck = await getFirebaseAppCheck();

  const { token } = await getToken(appCheck, false);

  if (token.length === 0) {
    throw new Error('APP_CHECK_TOKEN_UNAVAILABLE');
  }

  return token;
};
