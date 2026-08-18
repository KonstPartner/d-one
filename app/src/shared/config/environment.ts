import Constants from 'expo-constants';

type AndroidAppCheckProvider = 'debug' | 'playIntegrity';

type FirebaseEnvironment = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

type AppEnvironment = {
  publicAppUrl?: string;
  apiBaseUrl?: string;
  webGoogleClientId?: string;
  androidGoogleClientId?: string;
  iosGoogleClientId?: string;
  projectId?: string;
  firebase: FirebaseEnvironment;
  appCheckAndroidProvider?: AndroidAppCheckProvider;
  appCheckAndroidDebugToken?: string;
};

const extra = Constants.expoConfig?.extra as
  | {
      publicAppUrl?: string;
      apiBaseUrl?: string;
      webGoogleClientId?: string;
      androidGoogleClientId?: string;
      iosGoogleClientId?: string;
      firebase?: FirebaseEnvironment;
      eas?: {
        projectId?: string;
      };

      appCheck?: {
        androidProvider?: AndroidAppCheckProvider;
        androidDebugToken?: string;
      };
    }
  | undefined;

export const envConfig: AppEnvironment = {
  publicAppUrl: extra?.publicAppUrl,
  apiBaseUrl: extra?.apiBaseUrl,

  webGoogleClientId: extra?.webGoogleClientId,

  androidGoogleClientId: extra?.androidGoogleClientId,

  iosGoogleClientId: extra?.iosGoogleClientId,

  projectId: extra?.eas?.projectId,

  appCheckAndroidProvider: extra?.appCheck?.androidProvider,
  appCheckAndroidDebugToken: extra?.appCheck?.androidDebugToken,

  firebase: {
    apiKey: extra?.firebase?.apiKey,
    authDomain: extra?.firebase?.authDomain,
    projectId: extra?.firebase?.projectId,
    storageBucket: extra?.firebase?.storageBucket,
    messagingSenderId: extra?.firebase?.messagingSenderId,
    appId: extra?.firebase?.appId,
    measurementId: extra?.firebase?.measurementId,
  },
};

const requiredValues: ReadonlyArray<readonly [string, string | undefined]> = [
  ['publicAppUrl', envConfig.publicAppUrl],
  ['apiBaseUrl', envConfig.apiBaseUrl],
  ['webGoogleClientId', envConfig.webGoogleClientId],
  ['androidGoogleClientId', envConfig.androidGoogleClientId],
  ['iosGoogleClientId', envConfig.iosGoogleClientId],
  ['firebase.apiKey', envConfig.firebase.apiKey],
  ['firebase.authDomain', envConfig.firebase.authDomain],
  ['firebase.projectId', envConfig.firebase.projectId],
  ['firebase.storageBucket', envConfig.firebase.storageBucket],
  ['firebase.messagingSenderId', envConfig.firebase.messagingSenderId],
  ['firebase.appId', envConfig.firebase.appId],
  ['firebase.measurementId', envConfig.firebase.measurementId],
];

let validated = false;

export const validateEnvConfig = (): void => {
  if (validated) {
    return;
  }

  for (const [key, value] of requiredValues) {
    if (!value) {
      throw new Error(`Missing config: ${key}`);
    }
  }

  validated = true;
};
