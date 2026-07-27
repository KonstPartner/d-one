import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;

export const envConfig = {
  publicAppUrl: extra?.publicAppUrl as string | undefined,
  apiBaseUrl: extra?.apiBaseUrl as string | undefined,
  webGoogleClientId: extra?.webGoogleClientId as string | undefined,
  androidGoogleClientId: extra?.androidGoogleClientId as string | undefined,
  iosGoogleClientId: extra?.iosGoogleClientId as string | undefined,
  projectId: extra?.eas.projectId as string | undefined,
};

const required = [
  'publicAppUrl',
  'apiBaseUrl',
  'webGoogleClientId',
  'androidGoogleClientId',
  'iosGoogleClientId',
];

for (const key of required) {
  if (!envConfig[key as keyof typeof envConfig]) {
    throw new Error(`Missing config: ${key}`);
  }
}
