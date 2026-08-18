import {
  createDefaultDiaryEntryQuery,
  DIARY_BACKUP_CHUNK_SIZE,
  type DiaryBackupRecordsScope,
  type DiaryEntry,
  type DiaryEntryQuery,
  type DiaryLocalRepository,
} from '@entities/diary';

import type { DiaryExportScope } from './diaryExport.types';

type DiaryExportScopeStats = {
  entriesCount: number;
  localPhotosCount: number;
};

export type DiaryExportScopeReader = {
  recordsScope: DiaryBackupRecordsScope;

  getStats: () => Promise<DiaryExportScopeStats>;

  forEachBatch: (
    visitor: (entries: readonly DiaryEntry[]) => Promise<void>
  ) => Promise<void>;
};

const isExportableEntry = (entry: DiaryEntry): boolean =>
  entry.syncStatus !== 'pendingDelete';

const createPeriodQuery = ({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): DiaryEntryQuery => {
  const fromTimestamp = from.getTime();
  const toTimestamp = to.getTime();

  if (
    Number.isNaN(fromTimestamp) ||
    Number.isNaN(toTimestamp) ||
    fromTimestamp > toTimestamp
  ) {
    throw new Error('Invalid diary export period');
  }

  const query = createDefaultDiaryEntryQuery();

  return {
    ...query,

    eventAt: {
      from,
      to,
    },
  };
};

const createQueryScopeReader = ({
  repository,
  query,
  recordsScope,
}: {
  repository: DiaryLocalRepository;
  query: DiaryEntryQuery;
  recordsScope: DiaryBackupRecordsScope;
}): DiaryExportScopeReader => ({
  recordsScope,

  getStats: () => repository.countBackupEntries(query),

  forEachBatch: async (visitor) => {
    let offset = 0;
    let hasNextBatch = true;

    while (hasNextBatch) {
      const entries = await repository.findBackupBatch({
        offset,
        limit: DIARY_BACKUP_CHUNK_SIZE,
        query,
      });

      if (entries.length === 0) {
        return;
      }

      await visitor(entries);

      offset += entries.length;
      hasNextBatch = entries.length === DIARY_BACKUP_CHUNK_SIZE;
    }
  },
});

const createSelectedScopeReader = ({
  repository,
  entryIds,
}: {
  repository: DiaryLocalRepository;
  entryIds: readonly string[];
}): DiaryExportScopeReader => {
  const frozenEntryIds = Array.from(new Set(entryIds));

  if (
    frozenEntryIds.length === 0 ||
    frozenEntryIds.some((entryId) => entryId.length === 0)
  ) {
    throw new Error('Invalid diary export selection');
  }

  const forEachBatch = async (
    visitor: (entries: readonly DiaryEntry[]) => Promise<void>
  ): Promise<void> => {
    for (
      let offset = 0;
      offset < frozenEntryIds.length;
      offset += DIARY_BACKUP_CHUNK_SIZE
    ) {
      const idBatch = frozenEntryIds.slice(
        offset,
        offset + DIARY_BACKUP_CHUNK_SIZE
      );

      const entries = (await repository.findByIds(idBatch)).filter(
        isExportableEntry
      );

      if (entries.length > 0) {
        await visitor(entries);
      }
    }
  };

  return {
    recordsScope: {
      type: 'selected',
    },

    getStats: async () => {
      let entriesCount = 0;
      let localPhotosCount = 0;

      await forEachBatch(async (entries) => {
        entriesCount += entries.length;

        localPhotosCount += entries.reduce(
          (count, entry) => count + (entry.localPhotoUri === null ? 0 : 1),
          0
        );
      });

      return {
        entriesCount,
        localPhotosCount,
      };
    },

    forEachBatch,
  };
};

export const createDiaryExportScopeReader = ({
  repository,
  scope,
}: {
  repository: DiaryLocalRepository;
  scope: DiaryExportScope;
}): DiaryExportScopeReader => {
  switch (scope.type) {
    case 'all':
      return createQueryScopeReader({
        repository,
        query: createDefaultDiaryEntryQuery(),
        recordsScope: {
          type: 'all',
        },
      });

    case 'period': {
      const query = createPeriodQuery(scope);

      return createQueryScopeReader({
        repository,
        query,
        recordsScope: {
          type: 'period',
          from: scope.from.toISOString(),
          to: scope.to.toISOString(),
        },
      });
    }

    case 'selected':
      return createSelectedScopeReader({
        repository,
        entryIds: scope.entryIds,
      });
  }
};
