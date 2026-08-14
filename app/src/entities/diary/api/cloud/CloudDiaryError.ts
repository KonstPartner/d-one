export type CloudDiaryErrorCode =
  | 'UNAUTHENTICATED'
  | 'ACCESS_DENIED'
  | 'NETWORK_ERROR'
  | 'INVALID_CLOUD_DATA'
  | 'QUERY_CONFIGURATION_ERROR'
  | 'UNKNOWN_ERROR';

export class CloudDiaryError extends Error {
  public constructor(public readonly code: CloudDiaryErrorCode) {
    super(code);

    this.name = 'CloudDiaryError';
  }
}

export const isCloudDiaryError = (error: unknown): error is CloudDiaryError =>
  error instanceof CloudDiaryError;
