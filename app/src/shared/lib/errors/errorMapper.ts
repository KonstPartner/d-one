import i18n from 'i18next';

import { ApiError, parseApiErrorPayload } from './apiError';

export type ErrorType = 'none' | 'firebase' | 'api' | 'cloud' | 'transfer';

type I18nErrorKey = `common.errors.${string}`;

type ErrorDictionary = Record<string, I18nErrorKey>;

const firebaseErrorDictionary: ErrorDictionary = {
  'user-not-found': 'common.errors.wrongEmailOrPassword',
  'auth/user-not-found': 'common.errors.wrongEmailOrPassword',
  'auth/invalid-credential': 'common.errors.wrongEmailOrPassword',
  'auth/wrong-password': 'common.errors.wrongEmailOrPassword',
  'auth/invalid-email': 'common.errors.wrongEmailOrPassword',

  'email-already-in-use': 'common.errors.emailAlreadyExists',
  'auth/email-already-in-use': 'common.errors.emailAlreadyExists',

  'custom/already-logged-in!': 'common.errors.alreadyLoggedIn',
  'custom/already-logged-in': 'common.errors.alreadyLoggedIn',

  'custom/no-user-is-currently-logged-in': 'common.errors.notLoggedInYet',

  'custom/invalid-credential-password': 'common.errors.wrongCurrentPassword',
  'auth/missing-password': 'common.errors.wrongCurrentPassword',

  'requires-recent-login': 'common.errors.loginAgainToChangeEmail',
  'auth/requires-recent-login': 'common.errors.loginAgainToChangeEmail',

  'auth/too-many-requests': 'common.errors.tooManyRequests',

  'custom/no-google-auth': 'common.errors.googleAuthorizationFailed',
  'custom/no-google-id-token': 'common.errors.googleIdTokenMissing',
  'custom/no-google-email': 'common.errors.googleEmailMissing',
  'custom/no-google-redirect-uri': 'common.errors.googleRedirectUriMissing',
  'custom/invalid-google-id-token': 'common.errors.invalidGoogleIdToken',

  'custom/no-current-user-email': 'common.errors.currentUserEmailMissing',

  unavailable: 'common.errors.network',
  'firestore/unavailable': 'common.errors.network',
  'deadline-exceeded': 'common.errors.network',
  'firestore/deadline-exceeded': 'common.errors.network',
  'auth/network-request-failed': 'common.errors.network',

  'permission-denied': 'common.errors.accessDenied',
  'firestore/permission-denied': 'common.errors.accessDenied',

  'custom/user-profile-not-found': 'common.errors.userProfileNotFound',
  'custom/invalid-user-profile': 'common.errors.invalidUserProfile',
};

const apiErrorDictionary: ErrorDictionary = {
  APP_CHECK_REQUIRED: 'common.errors.aiAccessFailed',
  INVALID_APP_CHECK_TOKEN: 'common.errors.aiAccessFailed',
  APP_NOT_ALLOWED: 'common.errors.aiAccessFailed',
  APP_CHECK_SERVICE_UNAVAILABLE: 'common.errors.aiAccessFailed',
  UNAUTHORIZED: 'common.errors.aiAccessFailed',
  EMAIL_NOT_VERIFIED: 'common.errors.aiAccessFailed',
  FORBIDDEN_ROLE: 'common.errors.aiAccessFailed',
  USER_PROFILE_NOT_FOUND: 'common.errors.aiAccessFailed',
  AUTH_SERVICE_UNAVAILABLE: 'common.errors.aiAccessFailed',

  INVALID_REQUEST: 'common.errors.aiInvalidRequest',
  INVALID_IMAGE_URL: 'common.errors.aiInvalidRequest',
  IMAGE_NOT_ANALYZABLE: 'common.errors.aiImageNotAnalyzable',
  IMAGE_TOO_LARGE: 'common.errors.aiImageTooLarge',

  AI_REQUEST_ALREADY_ACTIVE: 'common.errors.aiRequestAlreadyActive',
  USER_DAILY_LIMIT_REACHED: 'common.errors.aiUserDailyLimitReached',
  PROJECT_DAILY_LIMIT_REACHED: 'common.errors.aiProjectDailyLimitReached',
  REQUEST_TOO_FREQUENT: 'common.errors.aiRequestTooFrequent',

  AI_PROVIDER_ERROR: 'common.errors.aiProviderUnavailable',
  INVALID_AI_RESPONSE: 'common.errors.aiProviderUnavailable',
  AI_TIMEOUT: 'common.errors.aiTimeout',
};

const aiErrorReasonDictionary: ErrorDictionary = {
  invalid_photo_url: 'common.errors.aiInvalidPhotoUrl',
  url_context_not_confirmed: 'common.errors.aiImageRetrievalNotConfirmed',
  missing_output_text: 'common.errors.aiMissingOutputText',
  invalid_json: 'common.errors.aiInvalidJsonResponse',
  invalid_root: 'common.errors.aiInvalidResponseStructure',
  invalid_status: 'common.errors.aiInvalidResponseStatus',
  no_useful_result: 'common.errors.aiNoUsefulResult',
  timeout: 'common.errors.aiTimeout',
  provider_error: 'common.errors.aiProviderUnavailable',
};

const cloudErrorDictionary: ErrorDictionary = {
  UNAUTHENTICATED: 'common.errors.cloudUnauthenticated',
  unauthenticated: 'common.errors.cloudUnauthenticated',
  'firestore/unauthenticated': 'common.errors.cloudUnauthenticated',

  ACCESS_DENIED: 'common.errors.cloudAccessDenied',
  'permission-denied': 'common.errors.cloudAccessDenied',
  'firestore/permission-denied': 'common.errors.cloudAccessDenied',

  NETWORK_ERROR: 'common.errors.cloudNetwork',
  unavailable: 'common.errors.cloudNetwork',
  'firestore/unavailable': 'common.errors.cloudNetwork',
  'deadline-exceeded': 'common.errors.cloudNetwork',
  'firestore/deadline-exceeded': 'common.errors.cloudNetwork',

  INVALID_CLOUD_DATA: 'common.errors.cloudInvalidData',

  QUERY_CONFIGURATION_ERROR: 'common.errors.cloudQueryConfiguration',
  'failed-precondition': 'common.errors.cloudQueryConfiguration',
  'firestore/failed-precondition': 'common.errors.cloudQueryConfiguration',

  UNKNOWN_ERROR: 'common.errors.unknown',
};

const transferErrorDictionary: ErrorDictionary = {
  unsupportedPlatform: 'common.errors.diaryImportUnsupportedPlatform',

  invalidArchive: 'common.errors.diaryImportInvalidBackup',
  manifestMissing: 'common.errors.diaryImportInvalidBackup',
  manifestInvalid: 'common.errors.diaryImportInvalidBackup',
  unsafePath: 'common.errors.diaryImportInvalidBackup',
  chunkMissing: 'common.errors.diaryImportInvalidBackup',
  chunkInvalid: 'common.errors.diaryImportInvalidBackup',
  entryInvalid: 'common.errors.diaryImportInvalidBackup',
  duplicateEntryId: 'common.errors.diaryImportInvalidBackup',
  entryCountMismatch: 'common.errors.diaryImportInvalidBackup',

  unsupportedVersion: 'common.errors.diaryImportUnsupportedVersion',

  snapshotChanged: 'common.errors.diaryImportSnapshotChanged',
  conflictPlanInvalid: 'common.errors.diaryImportConflictPlanInvalid',
  fileRollbackFailed: 'common.errors.diaryImportRollbackFailed',

  processingFailed: 'common.errors.diaryImportPhotoFailed',
  invalidFile: 'common.errors.diaryImportPhotoFailed',
  fileTooLarge: 'common.errors.diaryImportPhotoFailed',
  storageFailed: 'common.errors.diaryImportPhotoFailed',
};

const transferMessageErrorDictionary: ReadonlyArray<
  readonly [string, I18nErrorKey]
> = [
  [
    'Diary import conflict summary is inconsistent',
    'common.errors.diaryImportConflictPlanInvalid',
  ],
  [
    'Diary import conflict decision is missing',
    'common.errors.diaryImportConflictPlanInvalid',
  ],
  [
    'Diary import photo summary is invalid',
    'common.errors.diaryImportConflictPlanInvalid',
  ],
  ['Invalid diary import batch', 'common.errors.diaryImportFailed'],
  ['Diary imported entry cannot be', 'common.errors.diaryImportFailed'],
  ['UNIQUE constraint failed', 'common.errors.diaryImportFailed'],
  ['database is locked', 'common.errors.diaryImportFailed'],
  ['SQLITE_', 'common.errors.diaryImportFailed'],
];

const normalizeText = (value: string): string | null => {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

const getErrorCode = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  return typeof error.code === 'string' ? normalizeText(error.code) : null;
};

const getErrorMessage = (error: unknown): string | null => {
  if (typeof error === 'string') {
    return normalizeText(error);
  }

  if (error instanceof Error) {
    return normalizeText(error.message);
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return normalizeText(error.message);
  }

  return null;
};

const getErrorDictionary = (type: ErrorType): ErrorDictionary | null => {
  switch (type) {
    case 'firebase':
      return firebaseErrorDictionary;

    case 'cloud':
      return cloudErrorDictionary;

    case 'transfer':
      return transferErrorDictionary;

    case 'api':
    case 'none':
      return null;
  }
};

const mapApiError = (error: ApiError): string => {
  const payload = parseApiErrorPayload(error.data);

  if (payload === null) {
    return error.message;
  }

  if (
    payload.code === 'AI_PROVIDER_ERROR' &&
    payload.provider?.message !== null &&
    payload.provider?.message !== undefined
  ) {
    return payload.provider.status === null
      ? i18n.t('common.errors.aiProviderErrorDetails', {
          message: payload.provider.message,
        })
      : i18n.t('common.errors.aiProviderErrorDetailsWithStatus', {
          status: payload.provider.status,
          message: payload.provider.message,
        });
  }

  if (payload.code === 'INTERNAL_ERROR' && payload.message !== null) {
    return payload.message;
  }

  if (payload.reason !== null) {
    const reasonKey = aiErrorReasonDictionary[payload.reason];

    if (reasonKey !== undefined) {
      return i18n.t(reasonKey);
    }
  }

  const codeKey = apiErrorDictionary[payload.code];

  if (codeKey !== undefined) {
    return i18n.t(codeKey);
  }

  return payload.message ?? payload.provider?.message ?? payload.code;
};

export const errorMapper = (
  error: unknown,
  type: ErrorType = 'none'
): string => {
  if (type === 'api' && error instanceof ApiError) {
    return mapApiError(error);
  }

  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const dictionary = getErrorDictionary(type);

  if (dictionary !== null) {
    const key =
      (code === null ? undefined : dictionary[code]) ??
      (message === null ? undefined : dictionary[message]);

    if (key !== undefined) {
      return i18n.t(key);
    }
  }

  if (type === 'transfer' && message !== null) {
    const match = transferMessageErrorDictionary.find(([fragment]) =>
      message.includes(fragment)
    );

    if (match !== undefined) {
      return i18n.t(match[1]);
    }
  }

  return message ?? code ?? i18n.t('common.errors.unknown');
};
