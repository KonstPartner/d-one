const DATABASE_NOT_AVAILABLE_MESSAGE =
  'Diary database is not accepting new operations';

export class DiaryDatabaseOperationGate {
  private activeOperations = 0;
  private closing = false;
  private idlePromise: Promise<void> | null = null;
  private resolveIdle: (() => void) | null = null;

  public get isClosing(): boolean {
    return this.closing;
  }

  public async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closing) {
      throw new Error(DATABASE_NOT_AVAILABLE_MESSAGE);
    }

    this.activeOperations += 1;

    try {
      return await operation();
    } finally {
      this.activeOperations -= 1;

      if (this.closing && this.activeOperations === 0) {
        this.resolveIdle?.();
        this.resolveIdle = null;
      }
    }
  }

  public stopAndWaitForIdle(): Promise<void> {
    this.closing = true;

    if (this.activeOperations === 0) {
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
