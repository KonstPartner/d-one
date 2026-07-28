import { PlatformOS } from '@features/shared/model';

export const GOOGLE_AUTH_REDIRECT_PATH = 'oauthredirect';

export const AUTH_CALLBACK_ROUTE = '/auth-callback';

export const GOOGLE_AUTH_AFTER_REDIRECT_ROUTE = AUTH_CALLBACK_ROUTE;

export const GOOGLE_AUTH_REDIRECT_URI = PlatformOS.ANDROID
  ? '<android-reversed-client-id>:/' + GOOGLE_AUTH_REDIRECT_PATH
  : PlatformOS.IOS
    ? '<ios-reversed-client-id>:/' + GOOGLE_AUTH_REDIRECT_PATH
    : undefined;

export const GOOGLE_AUTH_SCOPES = ['openid', 'profile', 'email'];

export const GOOGLE_DISCOVERY = {
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
