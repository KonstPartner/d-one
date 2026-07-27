import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLanguage } from '@features/i18n/model/resources';

const KEY = 'app_language';

export const getSavedLanguage = async (): Promise<AppLanguage | null> => {
  const v = await AsyncStorage.getItem(KEY);

  return v === 'en' ? v : null;
};

export const saveLanguage = async (lng: AppLanguage) => {
  await AsyncStorage.setItem(KEY, lng);
};
