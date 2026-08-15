import i18n from 'i18next';

export type ErrorType = 'none' | 'firebase' | 'api' | 'cloud' | 'transfer';

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

  'common.errors.network': [
    'unavailable',
    'deadline-exceeded',
    'auth/network-request-failed',
  ],

  'common.errors.accessDenied': ['permission-denied'],

  'common.errors.userProfileNotFound': 'custom/user-profile-not-found',

  'common.errors.invalidUserProfile': 'custom/invalid-user-profile',
};

const apiErrorDictionary: ErrorDictionary = {
  'common.errors.aiAccessFailed': [
    'APP_CHECK_REQUIRED',
    'INVALID_APP_CHECK_TOKEN',
    'APP_NOT_ALLOWED',
    'APP_CHECK_SERVICE_UNAVAILABLE',
    'UNAUTHORIZED',
    'EMAIL_NOT_VERIFIED',
    'FORBIDDEN_ROLE',
    'USER_PROFILE_NOT_FOUND',
    'AUTH_SERVICE_UNAVAILABLE',
  ],

  'common.errors.aiInvalidRequest': ['INVALID_REQUEST', 'INVALID_IMAGE_URL'],

  'common.errors.aiImageNotAnalyzable': 'IMAGE_NOT_ANALYZABLE',

  'common.errors.aiImageTooLarge': 'IMAGE_TOO_LARGE',

  'common.errors.aiRequestAlreadyActive': 'AI_REQUEST_ALREADY_ACTIVE',

  'common.errors.aiUserDailyLimitReached': 'USER_DAILY_LIMIT_REACHED',

  'common.errors.aiProjectDailyLimitReached': 'PROJECT_DAILY_LIMIT_REACHED',

  'common.errors.aiRequestTooFrequent': 'REQUEST_TOO_FREQUENT',

  'common.errors.aiProviderUnavailable': [
    'AI_PROVIDER_ERROR',
    'INVALID_AI_RESPONSE',
    'INTERNAL_ERROR',
  ],

  'common.errors.aiTimeout': 'AI_TIMEOUT',
};

const cloudErrorDictionary: ErrorDictionary = {
  'common.errors.cloudUnauthenticated': 'UNAUTHENTICATED',

  'common.errors.cloudAccessDenied': 'ACCESS_DENIED',

  'common.errors.cloudNetwork': 'NETWORK_ERROR',

  'common.errors.cloudInvalidData': 'INVALID_CLOUD_DATA',

  'common.errors.cloudQueryConfiguration': 'QUERY_CONFIGURATION_ERROR',

  'common.errors.unknown': 'UNKNOWN_ERROR',
};

const transferErrorDictionary: ErrorDictionary = {
  'common.errors.diaryImportUnsupportedPlatform': 'unsupportedPlatform',

  'common.errors.diaryImportInvalidBackup': [
    'invalidArchive',
    'manifestMissing',
    'manifestInvalid',
    'unsafePath',
    'chunkMissing',
    'chunkInvalid',
    'entryInvalid',
    'duplicateEntryId',
    'entryCountMismatch',
  ],

  'common.errors.diaryImportUnsupportedVersion': 'unsupportedVersion',

  'common.errors.diaryImportPickerFailed': 'DIARY_IMPORT_PICKER_FAILED',

  'common.errors.diaryImportSnapshotChanged': 'snapshotChanged',

  'common.errors.diaryImportConflictPlanInvalid': [
    'conflictPlanInvalid',
    'Diary import conflict summary is inconsistent',
    'Diary import conflict decision is missing',
    'Diary import photo summary is invalid',
  ],

  'common.errors.diaryImportRollbackFailed': 'fileRollbackFailed',

  'common.errors.diaryImportPhotoFailed': [
    'processingFailed',
    'invalidFile',
    'fileTooLarge',
    'storageFailed',
  ],

  'common.errors.diaryImportPartialFailed': 'DIARY_IMPORT_PARTIAL_FAILED',

  'common.errors.diaryImportRefreshFailed': 'DIARY_IMPORT_REFRESH_FAILED',

  'common.errors.diaryImportFailed': [
    'DIARY_IMPORT_FAILED',
    'Invalid diary import batch',
    'Diary imported entry cannot be',
    'UNIQUE constraint failed',
    'database is locked',
    'SQLITE_',
  ],

  'common.errors.diaryExportEmpty': 'DIARY_EXPORT_EMPTY',

  'common.errors.diaryExportFailed': 'DIARY_EXPORT_FAILED',

  'common.errors.diaryExportFilesLoadFailed': 'DIARY_EXPORT_FILES_LOAD_FAILED',

  'common.errors.diaryExportResumeFailed': 'DIARY_EXPORT_RESUME_FAILED',

  'common.errors.diaryExportDeleteFailed': 'DIARY_EXPORT_DELETE_FAILED',

  'common.errors.diaryExportSaveFailed': 'DIARY_EXPORT_SAVE_FAILED',

  'common.errors.diaryExportShareFailed': 'DIARY_EXPORT_SHARE_FAILED',
};

const getErrorDictionary = (type: ErrorType): ErrorDictionary => {
  switch (type) {
    case 'firebase':
      return firebaseErrorDictionary;

    case 'api':
      return apiErrorDictionary;

    case 'cloud':
      return cloudErrorDictionary;

    case 'transfer':
      return transferErrorDictionary;

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
