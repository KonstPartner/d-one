const DIARY_QUERY_KEY = ['diary'] as const;

const localRoot = (userId: string) =>
  [...DIARY_QUERY_KEY, 'local', userId] as const;

const localPagesRoot = (userId: string) =>
  [...localRoot(userId), 'pages'] as const;

const localEntriesRoot = (userId: string) =>
  [...localRoot(userId), 'entries'] as const;

export const diaryLocalQueryKeys = {
  root: localRoot,

  pagesRoot: localPagesRoot,

  page: ({ userId, page }: { userId: string; page: number }) =>
    [...localPagesRoot(userId), page] as const,

  entriesRoot: localEntriesRoot,

  entry: ({ userId, entryId }: { userId: string; entryId: string }) =>
    [...localEntriesRoot(userId), entryId] as const,
};
