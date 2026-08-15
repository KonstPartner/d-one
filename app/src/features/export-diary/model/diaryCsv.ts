import type { DiaryEntry, MealRelation } from '@entities/diary';

export const DIARY_CSV_COLUMNS = [
  'eventAt',
  'glucose',
  'mealRelation',
  'shortInsulin',
  'longInsulin',
  'carbsGram',
  'comment',
  'aiAnalysis',
  'photoUrl',
] as const;

export type DiaryCsvColumn = (typeof DIARY_CSV_COLUMNS)[number];

export type DiaryCsvLocalization = {
  language: string;

  headers: Record<DiaryCsvColumn, string>;

  mealRelations: Record<MealRelation, string>;
};

export type DiaryCsvFormatter = {
  headerRow: string;

  formatEntry: (entry: DiaryEntry) => string;
};

export type DiaryCsvFileResult = {
  fileUri: string;
  fileSize: number;
};

export type DiaryCsvFileSession = {
  append: (content: string) => void;

  createResultFile: (fileName: string) => DiaryCsvFileResult;

  cleanupWorkingFiles: () => void;
};

const CSV_DELIMITER = ';';
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@'] as const;

const escapeCsvCell = (value: string): string => {
  if (!/[;"\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
};

const protectCsvFormulaText = (value: string): string => {
  const trimmed = value.trimStart();

  if (
    trimmed.length > 0 &&
    CSV_FORMULA_PREFIXES.some((prefix) => trimmed.startsWith(prefix))
  ) {
    return `'${value}`;
  }

  return value;
};

const formatNullableNumber = (
  formatter: Intl.NumberFormat,
  value: number | null
): string => (value === null ? '' : formatter.format(value));

const formatMealRelation = (
  mealRelations: Record<MealRelation, string>,
  value: MealRelation | null
): string => (value === null ? '' : mealRelations[value]);

export const createDiaryCsvFormatter = ({
  language,
  headers,
  mealRelations,
}: DiaryCsvLocalization): DiaryCsvFormatter => {
  if (language.trim().length === 0) {
    throw new Error('Invalid diary CSV language');
  }

  const numberFormatter = new Intl.NumberFormat(language, {
    useGrouping: false,
    maximumFractionDigits: 20,
  });

  const dateTimeFormatter = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',

    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',

    hour12: false,
  });

  const headerRow = DIARY_CSV_COLUMNS.map((column) =>
    escapeCsvCell(headers[column])
  ).join(CSV_DELIMITER);

  const formatEntry = (entry: DiaryEntry): string => {
    if (entry.syncStatus === 'pendingDelete') {
      throw new Error(
        `Pending delete diary entry cannot be exported to CSV: ${entry.id}`
      );
    }

    if (Number.isNaN(entry.eventAt.getTime())) {
      throw new Error(`Invalid diary CSV event date: ${entry.id}`);
    }

    const cells = [
      dateTimeFormatter.format(entry.eventAt),

      formatNullableNumber(numberFormatter, entry.glucose),

      formatMealRelation(mealRelations, entry.mealRelation),

      formatNullableNumber(numberFormatter, entry.shortInsulin),

      formatNullableNumber(numberFormatter, entry.longInsulin),

      formatNullableNumber(numberFormatter, entry.carbsGram),

      protectCsvFormulaText(entry.comment),

      protectCsvFormulaText(entry.aiAnalysis),

      entry.photoUrl ?? '',
    ];

    return cells.map(escapeCsvCell).join(CSV_DELIMITER);
  };

  return {
    headerRow,
    formatEntry,
  };
};
