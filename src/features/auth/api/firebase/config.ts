import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { PlatformOS } from '@features/shared/model/constants';

const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (s: typeof AsyncStorage) => Persistence;
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

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = PlatformOS.WEB
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export { auth, db };
