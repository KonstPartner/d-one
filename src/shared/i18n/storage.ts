import AsyncStorage from '@react-native-async-storage/async-storage';

import { type AppLanguage, isAppLanguage } from './languages';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const getSavedLanguage = async (): Promise<AppLanguage | null> => {
  const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  return isAppLanguage(value) ? value : null;
};

export const saveLanguage = (language: AppLanguage): Promise<void> => {
  return AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};
