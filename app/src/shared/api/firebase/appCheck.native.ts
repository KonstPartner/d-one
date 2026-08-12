import { getApp } from '@react-native-firebase/app';
import {
  type AppCheck,
  getToken,
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';

let appCheckPromise: Promise<AppCheck> | null = null;

const initializeFirebaseAppCheck = async (): Promise<AppCheck> => {
  const provider = new ReactNativeFirebaseAppCheckProvider();

  provider.configure({
    android: {
      provider: __DEV__ ? 'debug' : 'playIntegrity',
    },

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
