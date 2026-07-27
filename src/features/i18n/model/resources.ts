export type AppLanguage = 'en' | 'de';

const merge = (...parts: any[]) => Object.assign({}, ...parts);

export const resources = {
  en: {
    translation: merge(),
  },
  de: {
    translation: merge(),
  },
} as const;
