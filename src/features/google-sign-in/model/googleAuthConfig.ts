import { envConfig } from '@shared/config';
import { PlatformOS } from '@shared/lib/platform';

export const GOOGLE_AUTH_REDIRECT_PATH = 'oauthredirect';

const ANDROID_APP_SCHEME = 'done.android.app';

const IOS_APP_SCHEME = 'done.app.ios';

export const GOOGLE_AUTH_REDIRECT_URI = PlatformOS.ANDROID
  ? `${ANDROID_APP_SCHEME}:/${GOOGLE_AUTH_REDIRECT_PATH}`
  : PlatformOS.IOS
    ? `${IOS_APP_SCHEME}:/${GOOGLE_AUTH_REDIRECT_PATH}`
    : undefined;

export const GOOGLE_AUTH_SCOPES = ['openid', 'profile', 'email'];

export const GOOGLE_DISCOVERY = {
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const getGoogleClientId = (): string | undefined => {
  if (PlatformOS.ANDROID) {
    return envConfig.androidGoogleClientId;
  }

  if (PlatformOS.IOS) {
    return envConfig.iosGoogleClientId;
  }

  return envConfig.webGoogleClientId;
};

export const googleClientIds = {
  webClientId: envConfig.webGoogleClientId,

  androidClientId: envConfig.androidGoogleClientId,

  iosClientId: envConfig.iosGoogleClientId,
};
