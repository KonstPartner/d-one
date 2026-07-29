import { authTranslations } from '@features/auth/i18n';
import { headerTranslations } from '@features/header/i18n';
import { layoutTranslations } from '@features/layout/i18n';
import { commonTranslations } from '@features/shared/i18n';

export type AppLanguage = 'en' | 'ru';

const merge = (...parts: any[]) => Object.assign({}, ...parts);

export const resources = {
  en: {
    translation: merge(
      headerTranslations.en,
      commonTranslations.en,
      authTranslations.en,
      layoutTranslations.en
    ),
  },
  ru: {
    translation: merge(
      headerTranslations.ru,
      commonTranslations.ru,
      authTranslations.ru,
      layoutTranslations.ru
    ),
  },
} as const;
