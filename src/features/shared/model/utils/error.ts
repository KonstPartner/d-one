import { i18n } from '@features/i18n/model';
import { ErrorType } from '@features/shared/model/types';

type I18nErrorKey = `common.errors.${string}`;
type Dict = Record<I18nErrorKey, string | string[]>;

const firebaseErrorDict: Dict = {
  'common.errors.wrongEmailOrPassword': [
    'user-not-found',
    'auth/user-not-found',
    'auth/invalid-credential',
    'auth/wrong-password',
    'auth/invalid-email',
  ],

  'common.errors.emailAlreadyExists': [
    'email-already-in-use',
    'auth/email-already-in-use',
  ],

  'common.errors.alreadyLoggedIn': [
    'custom/already-logged-in!',
    'custom/already-logged-in',
  ],

  'common.errors.notLoggedInYet': 'custom/no-user-is-currently-logged-in',

  'common.errors.wrongCurrentPassword': [
    'custom/invalid-credential-password',
    'auth/missing-password',
  ],

  'common.errors.loginAgainToChangeEmail': [
    'requires-recent-login',
    'auth/requires-recent-login',
  ],

  'common.errors.tooManyRequests': 'auth/too-many-requests',

  'common.errors.googleAuthorizationFailed': 'custom/no-google-auth',

  'common.errors.googleIdTokenMissing': 'custom/no-google-id-token',

  'common.errors.googleEmailMissing': 'custom/no-google-email',

  'common.errors.googleRedirectUriMissing': 'custom/no-google-redirect-uri',

  'common.errors.invalidGoogleIdToken': 'custom/invalid-google-id-token',

  'common.errors.currentUserEmailMissing': 'custom/no-current-user-email',
};

const apiErrorDict: Dict = {};

const setErrorDict = (type: ErrorType): Dict => {
  switch (type) {
    case 'firebase':
      return firebaseErrorDict;
    case 'api':
      return apiErrorDict;
    case 'none':
      return {};
  }
};

/**
 * Maps an error to a user-friendly message based on the error type and dictionary.
 *
 * @param {unknown} error - The error object that needs to be processed. Typically, an instance of `Error`.
 * @param {ErrorType} type - The category of the error.
 * @returns {string} - A user-friendly message for the error, or the original error message if not mapped.
 *                     Returns "Unknown error!" if the error is not an instance of `Error`.
 */
export const errorMapper = (error: unknown, type: ErrorType = 'none') => {
  if (error instanceof Error) {
    const dict = setErrorDict(type);

    for (const [key, matcher] of Object.entries(dict) as Array<
      [I18nErrorKey, string | string[]]
    >) {
      if (Array.isArray(matcher)) {
        if (matcher.some((m) => error.message.includes(m))) {
          return i18n.t(key);
        }
      } else {
        if (error.message.includes(matcher)) {
          return i18n.t(key);
        }
      }
    }

    console.error('errorMapper: ' + error.message);

    return error.message;
  }

  return i18n.t('common.errors.unknown');
};

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`${error.message}`);
  } else if (typeof error === 'object' && error !== null) {
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  } else {
    throw new Error(`Unknown error: ${error}`);
  }
};
