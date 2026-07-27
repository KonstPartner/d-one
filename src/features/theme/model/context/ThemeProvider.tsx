import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkTheme, lightTheme } from '@features/theme/model/tokens';
import { Mode } from '@features/theme/model/types';

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  isDark: boolean;
};

const C = createContext<Ctx | null>(null);

const useThemeMode = () => {
  const ctx = useContext(C);
  if (!ctx) {
    throw new Error('useThemeMode must be used inside AppThemeProvider');
  }

  return ctx;
};

const KEY = 'app_theme_mode';

const AppThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setMode(saved);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {});

    return () => sub.remove();
  }, []);

  const isDark = useMemo(
    () => (mode === 'system' ? (system ?? 'light') : mode) === 'dark',
    [mode, system]
  );

  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo<Ctx>(
    () => ({
      mode,
      isDark,
      setMode: async (m) => {
        setMode(m);
        await AsyncStorage.setItem(KEY, m);
      },
    }),
    [mode, isDark]
  );

  return (
    <C.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </C.Provider>
  );
};

export { AppThemeProvider, useThemeMode };
