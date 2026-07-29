import { envConfig, PlatformOS } from '@features/shared/model';

export const AUTH_CALLBACK_ROUTE = '/auth-callback';

export const GOOGLE_AUTH_AFTER_REDIRECT_ROUTE = AUTH_CALLBACK_ROUTE;

export const GOOGLE_AUTH_REDIRECT_PATH = 'oauthredirect';

export const ANDROID_APP_SCHEME = 'done.android.app';

export const IOS_APP_SCHEME = 'done.app.ios';

export const GOOGLE_AUTH_REDIRECT_URI = PlatformOS.ANDROID
  ? `${ANDROID_APP_SCHEME}:/${GOOGLE_AUTH_REDIRECT_PATH}`
  : PlatformOS.IOS
    ? `${IOS_APP_SCHEME}:/${GOOGLE_AUTH_REDIRECT_PATH}`
    : undefined;

export const GOOGLE_AUTH_SCOPES = ['openid', 'profile', 'email'];

export const GOOGLE_DISCOVERY = {
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const getGoogleClientId = () => {
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
