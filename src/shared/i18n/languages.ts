export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const isAppLanguage = (value: unknown): value is AppLanguage => {
  return (
    typeof value === 'string' &&
    SUPPORTED_LANGUAGES.includes(value as AppLanguage)
  );
};

export const normalizeAppLanguage = (language?: string | null): AppLanguage => {
  const baseLanguage = language?.split('-')[0];

  return isAppLanguage(baseLanguage) ? baseLanguage : DEFAULT_LANGUAGE;
};
