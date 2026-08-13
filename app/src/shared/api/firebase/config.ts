import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  getAuth,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { PlatformOS } from '@shared/lib/platform';

const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: 'AIzaSyDpHIqPfESGbmNaVVpK_lBYlIyNeNnrki8',
  authDomain: 'project-d-one.firebaseapp.com',
  projectId: 'project-d-one',
  storageBucket: 'project-d-one.firebasestorage.app',
  messagingSenderId: '130872563902',
  appId: '1:130872563902:web:06363e4110681cf35a26ef',
  measurementId: 'G-R925MN691H',
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
