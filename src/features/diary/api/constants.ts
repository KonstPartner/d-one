const DIARY_QUERY_KEY = ['diary'] as const;

const localRoot = (userId: string) =>
  [...DIARY_QUERY_KEY, 'local', userId] as const;

const localPagesRoot = (userId: string) =>
  [...localRoot(userId), 'pages'] as const;

export const diaryQueryKeys = {
  all: DIARY_QUERY_KEY,

  localRoot,

  localPagesRoot,

  localPage: ({ userId, page }: { userId: string; page: number }) =>
    [...localPagesRoot(userId), page] as const,
};
