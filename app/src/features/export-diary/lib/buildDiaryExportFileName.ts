import type {
  DiaryExportFormat,
  DiaryExportScope,
} from '../model/diaryExport.types';

const APP_FILE_NAME = 'd-one';
const FALLBACK_USER_NAME = 'user';

const pad = (value: number): string => value.toString().padStart(2, '0');

const formatLocalDate = (value: Date): string =>
  [value.getFullYear(), pad(value.getMonth() + 1), pad(value.getDate())].join(
    '-'
  );

const formatLocalDateTime = (value: Date): string =>
  `${formatLocalDate(value)}_${pad(value.getHours())}-${pad(
    value.getMinutes()
  )}-${pad(value.getSeconds())}`;

const normalizeUserName = (value: string): string => {
  const normalized = value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return normalized.length > 0 ? normalized : FALLBACK_USER_NAME;
};

const getExportTypePart = (format: DiaryExportFormat): string => {
  switch (format) {
    case 'fullBackup':
      return 'backup';

    case 'lightweightBackup':
      return 'backup-light';

    case 'csv':
      return 'csv';
  }
};

const getScopePart = (scope: DiaryExportScope): string => {
  switch (scope.type) {
    case 'all':
      return 'all';

    case 'selected':
      return 'selected';

    case 'period':
      return `${formatLocalDate(scope.from)}_to_${formatLocalDate(scope.to)}`;
  }
};

const getExtension = (format: DiaryExportFormat): 'zip' | 'csv' =>
  format === 'csv' ? 'csv' : 'zip';

export const buildDiaryExportFileName = ({
  format,
  userName,
  exportedAt,
  scope,
}: {
  format: DiaryExportFormat;
  userName: string;
  exportedAt: Date;
  scope: DiaryExportScope;
}): string => {
  const timestamp = exportedAt.getTime();

  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid diary export date');
  }

  if (
    scope.type === 'period' &&
    (Number.isNaN(scope.from.getTime()) ||
      Number.isNaN(scope.to.getTime()) ||
      scope.from.getTime() > scope.to.getTime())
  ) {
    throw new Error('Invalid diary export period');
  }

  return (
    [
      APP_FILE_NAME,
      getExportTypePart(format),
      normalizeUserName(userName),
      formatLocalDateTime(exportedAt),
      getScopePart(scope),
    ].join('_') + `.${getExtension(format)}`
  );
};
