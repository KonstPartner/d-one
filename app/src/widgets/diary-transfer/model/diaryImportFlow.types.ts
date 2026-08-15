export type ImportConflictStrategySelection = 'skip' | 'replace' | 'review';

export type ImportConfirmationSummary = {
  entriesCount: number;

  newEntries: number;
  replacedEntries: number;
  skippedEntries: number;

  photosCount: number;
};
