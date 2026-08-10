import i18n from 'i18next';

export type ErrorType = 'none' | 'firebase' | 'api';

type I18nErrorKey = `common.errors.${string}`;

type ErrorDictionary = Record<I18nErrorKey, string | string[]>;

const firebaseErrorDictionary: ErrorDictionary = {
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

const apiErrorDictionary: ErrorDictionary = {};

const getErrorDictionary = (type: ErrorType): ErrorDictionary => {
  switch (type) {
    case 'firebase':
      return firebaseErrorDictionary;

    case 'api':
      return apiErrorDictionary;

    case 'none':
      return {};
  }
};

export const errorMapper = (
  error: unknown,
  type: ErrorType = 'none'
): string => {
  if (!(error instanceof Error)) {
    return i18n.t('common.errors.unknown');
  }

  const dictionary = getErrorDictionary(type);

  for (const [key, matcher] of Object.entries(dictionary) as Array<
    [I18nErrorKey, string | string[]]
  >) {
    const matched = Array.isArray(matcher)
      ? matcher.some((value) => error.message.includes(value))
      : error.message.includes(matcher);

    if (matched) {
      return i18n.t(key);
    }
  }

  console.error(`errorMapper: ${error.message}`);

  return error.message;
};

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(error.message);
  }

  if (typeof error === 'object' && error !== null) {
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }

  throw new Error(`Unknown error: ${String(error)}`);
};
