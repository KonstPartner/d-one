import type { AppLanguage } from '@shared/i18n';

type ReleaseDateFormat = 'long' | 'short';

const LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

const parseReleaseDate = (releasedAt: string): Date | null => {
  const [year, month, day] = releasedAt.split('-').map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
};

export const formatReleaseDate = (
  releasedAt: string,
  language: AppLanguage,
  format: ReleaseDateFormat
): string => {
  const date = parseReleaseDate(releasedAt);

  if (date === null || Number.isNaN(date.getTime())) {
    return releasedAt;
  }

  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    day: format === 'short' ? '2-digit' : 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};
