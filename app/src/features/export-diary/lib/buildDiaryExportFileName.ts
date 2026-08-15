import type {
  DiaryExportFormat,
  DiaryExportScope,
} from '../model/diaryExport.types';

const APP_FILE_NAME = 'd-one';
const SAFE_USER_NAME_PATTERN = /^[\p{L}\p{N}_-]{1,32}$/u;

const pad = (value: number): string => value.toString().padStart(2, '0');

const formatLocalDate = (value: Date): string =>
  [
    pad(value.getDate()),
    pad(value.getMonth() + 1),
    pad(value.getFullYear() % 100),
  ].join('-');

const formatLocalDateTime = (value: Date): string =>
  `${formatLocalDate(value)}_${pad(value.getHours())}-${pad(
    value.getMinutes()
  )}-${pad(value.getSeconds())}`;

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

  if (!SAFE_USER_NAME_PATTERN.test(userName)) {
    throw new Error('Invalid diary export user name');
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
      userName,
      formatLocalDateTime(exportedAt),
      getScopePart(scope),
    ].join('_') + `.${getExtension(format)}`
  );
};
