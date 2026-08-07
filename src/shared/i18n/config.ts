import './calendar';

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LocaleConfig } from 'react-native-calendars';

import {
  type AppLanguage,
  DEFAULT_LANGUAGE,
  isAppLanguage,
  normalizeAppLanguage,
} from './languages';
import { resources } from './resources';
import { getSavedLanguage } from './storage';

let initialization: Promise<typeof i18n> | null = null;

i18n.on('languageChanged', (language) => {
  LocaleConfig.defaultLocale = normalizeAppLanguage(language);
});

const resolveInitialLanguage = async (): Promise<AppLanguage> => {
  const savedLanguage = await getSavedLanguage();

  if (savedLanguage) {
    return savedLanguage;
  }

  const deviceLanguage = Localization.getLocales()?.[0]?.languageCode;

  return isAppLanguage(deviceLanguage) ? deviceLanguage : DEFAULT_LANGUAGE;
};

export const initI18n = (): Promise<typeof i18n> => {
  if (initialization) {
    return initialization;
  }

  initialization = (async () => {
    const language = await resolveInitialLanguage();

    await i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,

      interpolation: {
        escapeValue: false,
      },
    });

    return i18n;
  })();

  return initialization;
};

export const setAppLanguage = async (language: AppLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
};

export default i18n;
