import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { ThemeMode } from '@shared/config';
import { useThemeMode } from '@shared/lib/theme';

import * as s from '../styles/ThemeSwitcher';

type IconName = ComponentProps<typeof Ionicons>['name'];

type ThemeOption = {
  mode: ThemeMode;
  icon: IconName;
};

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    mode: 'light',
    icon: 'sunny-outline',
  },
  {
    mode: 'dark',
    icon: 'moon-outline',
  },
  {
    mode: 'system',
    icon: 'desktop-outline',
  },
];

export const ThemeSwitcher = () => {
  const theme = useTheme();

  const { mode, setMode } = useThemeMode();

  return (
    <s.Container
      accessibilityRole="radiogroup"
      accessibilityLabel="Color theme"
    >
      {THEME_OPTIONS.map((option) => {
        const selected = mode === option.mode;

        return (
          <s.ModeButton
            key={option.mode}
            accessibilityRole="radio"
            accessibilityLabel={option.mode}
            accessibilityState={{
              selected,
            }}
            style={s.getModeButtonStyle(theme, selected)}
            onPress={() => {
              setMode(option.mode);
            }}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={selected ? theme.colors.bg : theme.colors.muted}
            />
          </s.ModeButton>
        );
      })}
    </s.Container>
  );
};
