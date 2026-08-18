import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  getAuth,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { envConfig } from '@shared/config';
import { PlatformOS } from '@shared/lib/platform';

const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: envConfig.firebase.apiKey,
  authDomain: envConfig.firebase.authDomain,
  projectId: envConfig.firebase.projectId,
  storageBucket: envConfig.firebase.storageBucket,
  messagingSenderId: envConfig.firebase.messagingSenderId,
  appId: envConfig.firebase.appId,
  measurementId: envConfig.firebase.measurementId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const getNativeAuth = (): Auth => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: unknown) {
    const errorCode = (
      error as {
        code?: string;
      }
    ).code;

    if (errorCode === 'auth/already-initialized') {
      return getAuth(app);
    }

    throw error;
  }
};

const auth = PlatformOS.WEB ? getAuth(app) : getNativeAuth();

const db = getFirestore(app);

export { app, auth, db };
