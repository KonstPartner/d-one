import '@features/i18n/model/calendar';

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LocaleConfig } from 'react-native-calendars';

import { AppLanguage, resources } from '@features/i18n/model/resources';
import { getSavedLanguage } from '@features/i18n/model/storage';

const FALLBACK: AppLanguage = 'en';
i18n.on('languageChanged', (lng) => {
  LocaleConfig.defaultLocale = lng;
});

export const initI18n = async () => {
  const saved = await getSavedLanguage();
  const device = Localization.getLocales()?.[0]?.languageCode as
    | AppLanguage
    | undefined;

  const lng =
    saved ?? (device && resources[device] ? device : undefined) ?? FALLBACK;

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: FALLBACK,
    interpolation: { escapeValue: false },
  });

  return i18n;
};
export const setAppLanguage = async (lng: AppLanguage) => {
  await i18n.changeLanguage(lng);
};

export default i18n;
