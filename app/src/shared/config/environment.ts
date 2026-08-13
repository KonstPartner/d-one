import Constants from 'expo-constants';

type AppEnvironment = {
  publicAppUrl?: string;
  apiBaseUrl?: string;
  webGoogleClientId?: string;
  androidGoogleClientId?: string;
  iosGoogleClientId?: string;
  projectId?: string;
};

const extra = Constants.expoConfig?.extra as
  | {
      publicAppUrl?: string;
      apiBaseUrl?: string;
      webGoogleClientId?: string;
      androidGoogleClientId?: string;
      iosGoogleClientId?: string;
      eas?: {
        projectId?: string;
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
};

const requiredKeys: Array<keyof AppEnvironment> = [
  'publicAppUrl',
  'apiBaseUrl',
  'webGoogleClientId',
  'androidGoogleClientId',
  'iosGoogleClientId',
];

for (const key of requiredKeys) {
  if (!envConfig[key]) {
    throw new Error(`Missing config: ${key}`);
  }
}
