import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { useDiarySyncRuntime } from '@features/diary/api';
import {
  DiaryDatabaseProvider,
  useDiaryDatabase,
} from '@features/diary/api/sqlite';
import { PlatformOS } from '@shared/lib/platform';
import { ErrorSection, LoadingView } from '@shared/ui';

type DiaryRuntimeBoundaryProps = PropsWithChildren<{
  enabled: boolean;
  userId: string | null;
}>;

const supportsLocalDiary = PlatformOS.ANDROID || PlatformOS.IOS;

const DiaryDatabaseStatusBoundary = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { status, retry } = useDiaryDatabase();

  if (status === 'opening') {
    return <LoadingView loading />;
  }

  if (status === 'error') {
    return (
      <ErrorSection
        message={t('diary.database.initializationFailed')}
        onRetry={retry}
      />
    );
  }

  return <>{children}</>;
};

const DiarySyncRuntime = ({ children }: PropsWithChildren) => {
  useDiarySyncRuntime();

  return <>{children}</>;
};

export const DiaryRuntimeBoundary = ({
  children,
  enabled,
  userId,
}: DiaryRuntimeBoundaryProps) => {
  if (!enabled || !supportsLocalDiary) {
    return <>{children}</>;
  }

  if (userId === null) {
    return <LoadingView loading />;
  }

  return (
    <DiaryDatabaseProvider userId={userId}>
      <DiaryDatabaseStatusBoundary>
        <DiarySyncRuntime>{children}</DiarySyncRuntime>
      </DiaryDatabaseStatusBoundary>
    </DiaryDatabaseProvider>
  );
};
