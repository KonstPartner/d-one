export type DiaryImportExecutionErrorCode =
  | 'snapshotChanged'
  | 'conflictPlanInvalid'
  | 'fileRollbackFailed';

export class DiaryImportExecutionError extends Error {
  public constructor(public readonly code: DiaryImportExecutionErrorCode) {
    super(code);

    this.name = 'DiaryImportExecutionError';
  }
}

export const isDiaryImportExecutionError = (
  error: unknown
): error is DiaryImportExecutionError =>
  error instanceof DiaryImportExecutionError;
