import { authTranslations } from './resources/auth';
import { commonTranslations } from './resources/common';
import { diaryTranslations } from './resources/diary';
import { diaryAiTranslations } from './resources/diaryAi';
import { headerTranslations } from './resources/header';
import { layoutTranslations } from './resources/layout';
import { transferTranslations } from './resources/transfer';

const mergeTranslations = (...parts: Record<string, unknown>[]) =>
  Object.assign({}, ...parts);

export const resources = {
  en: {
    translation: mergeTranslations(
      commonTranslations.en,
      authTranslations.en,
      layoutTranslations.en,
      headerTranslations.en,
      diaryTranslations.en,
      diaryAiTranslations.en,
      transferTranslations.en
    ),
  },

  ru: {
    translation: mergeTranslations(
      commonTranslations.ru,
      authTranslations.ru,
      layoutTranslations.ru,
      headerTranslations.ru,
      diaryTranslations.ru,
      diaryAiTranslations.ru,
      transferTranslations.ru
    ),
  },
} as const;
