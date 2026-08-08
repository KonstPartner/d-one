import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import type {
  SurfaceShadowLevel,
  SurfaceTone,
  ThemeRadius,
  ThemeSpacing,
} from './types';

const getSurfaceBackground = (theme: Theme, tone: SurfaceTone): string => {
  switch (tone) {
    case 'input':
      return theme.colors.input;

    case 'background':
      return theme.colors.bg;

    case 'primarySoft':
      return theme.colors.shades.primary.sm;

    default:
      return theme.colors.card;
  }
};

export const Surface = (
  theme: Theme,
  tone: SurfaceTone = 'card',
  withBorder = true
) =>
  css`
    background-color: ${getSurfaceBackground(theme, tone)};

    border-width: ${withBorder ? theme.border.width.sm : 0}px;

    border-color: ${theme.colors.border};
  ` as ViewStyle;

export const Rounded = (theme: Theme, radius: ThemeRadius = 'lg') =>
  css`
    border-radius: ${theme.radius[radius]}px;
  ` as ViewStyle & TextStyle;

export const Inset = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding: ${theme.spacing[size]}px;
  ` as ViewStyle;

export const InsetX = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-left: ${theme.spacing[size]}px;
    padding-right: ${theme.spacing[size]}px;
  ` as ViewStyle;

export const InsetY = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-top: ${theme.spacing[size]}px;
    padding-bottom: ${theme.spacing[size]}px;
  ` as ViewStyle;

export const CardContainer = (
  theme: Theme,
  padding: ThemeSpacing = 'lg',
  radius: ThemeRadius = 'lg'
) =>
  css`
    ${Surface(theme)};
    ${Rounded(theme, radius)};
    ${Inset(theme, padding)};
  ` as ViewStyle;

export const Shadow = (theme: Theme, level: SurfaceShadowLevel = 'soft') => {
  const strong = level === 'strong';

  return css`
    shadow-color: ${theme.colors.black};

    shadow-offset: 0px ${strong ? 18 : 10}px;

    shadow-opacity: ${theme.mode === 'dark'
      ? strong
        ? 0.42
        : 0.32
      : strong
        ? 0.08
        : 0.055};

    shadow-radius: ${strong ? 44 : 24}px;

    elevation: ${strong ? 8 : 3};
  ` as ViewStyle;
};

export const Divider = (theme: Theme) =>
  css`
    height: ${theme.border.width.sm}px;

    background-color: ${theme.colors.border};

    opacity: 0.7;
  ` as ViewStyle;
