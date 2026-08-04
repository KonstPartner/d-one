const DATABASE_NOT_AVAILABLE_MESSAGE =
  'Diary database is not accepting new operations';

export class DiaryDatabaseOperationGate {
  private pendingOperations = 0;
  private closing = false;
  private operationQueue: Promise<void> = Promise.resolve();
  private idlePromise: Promise<void> | null = null;
  private resolveIdle: (() => void) | null = null;

  public get isClosing(): boolean {
    return this.closing;
  }

  public run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closing) {
      return Promise.reject(new Error(DATABASE_NOT_AVAILABLE_MESSAGE));
    }

    this.pendingOperations += 1;

    const result = this.operationQueue.then(operation);

    this.operationQueue = result.then(
      () => undefined,
      () => undefined
    );

    return result.finally(() => {
      this.pendingOperations -= 1;

      if (this.closing && this.pendingOperations === 0) {
        this.resolveIdle?.();
        this.resolveIdle = null;
      }
    });
  }

  public stopAndWaitForIdle(): Promise<void> {
    this.closing = true;

    if (this.pendingOperations === 0) {
      return Promise.resolve();
    }

    if (this.idlePromise === null) {
      this.idlePromise = new Promise((resolve) => {
        this.resolveIdle = resolve;
      });
    }

    return this.idlePromise;
  }
}
