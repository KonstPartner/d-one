import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeMode } from './types';

const THEME_MODE_STORAGE_KEY = 'app_theme_mode';

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'system' || value === 'light' || value === 'dark';
};

export const loadThemeMode = async (): Promise<ThemeMode | null> => {
  const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);

  return isThemeMode(storedMode) ? storedMode : null;
};

export const saveThemeMode = (mode: ThemeMode): Promise<void> => {
  return AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
};
