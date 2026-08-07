import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

import {
  darkTheme,
  lightTheme,
  loadThemeMode,
  saveThemeMode,
  type ThemeMode,
} from '@shared/config/theme';
import {
  type ThemeModeContextValue,
  ThemeModeProvider,
} from '@shared/lib/theme';

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const systemMode = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;

    const restoreThemeMode = async (): Promise<void> => {
      try {
        const storedMode = await loadThemeMode();

        if (mounted && storedMode) {
          setModeState(storedMode);
        }
      } catch (error: unknown) {
        console.error('Failed to restore theme mode', error);
      }
    };

    void restoreThemeMode();

    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode): void => {
    setModeState(nextMode);

    void saveThemeMode(nextMode).catch((error: unknown) => {
      console.error('Failed to save theme mode', error);
    });
  }, []);

  const resolvedMode = mode === 'system' ? (systemMode ?? 'light') : mode;

  const isDark = resolvedMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      isDark,
      setMode,
    }),
    [mode, isDark, setMode]
  );

  return (
    <ThemeModeProvider value={contextValue}>
      <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
    </ThemeModeProvider>
  );
};
