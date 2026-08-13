import { createContext, type PropsWithChildren, useContext } from 'react';

import type { ThemeMode } from '@shared/config/theme';

export type ThemeModeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

type ThemeModeProviderProps = PropsWithChildren<{
  value: ThemeModeContextValue;
}>;

export const ThemeModeProvider = ({
  value,
  children,
}: ThemeModeProviderProps) => {
  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
};
