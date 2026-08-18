import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import { px } from './toPX';
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
    border-width: ${px(withBorder ? theme.border.width.sm : 0)};
    border-color: ${theme.colors.border};
  ` as ViewStyle;

export const Rounded = (theme: Theme, radius: ThemeRadius = 'lg') =>
  css`
    border-radius: ${px(theme.radius[radius])};
  ` as ViewStyle & TextStyle;

export const Inset = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding: ${px(theme.spacing[size])};
  ` as ViewStyle;

export const InsetX = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-left: ${px(theme.spacing[size])};
    padding-right: ${px(theme.spacing[size])};
  ` as ViewStyle;

export const InsetY = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-top: ${px(theme.spacing[size])};
    padding-bottom: ${px(theme.spacing[size])};
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

    shadow-offset: 0px ${px(strong ? 18 : 10)};

    shadow-opacity: ${theme.mode === 'dark'
      ? strong
        ? 0.42
        : 0.32
      : strong
        ? 0.08
        : 0.055};

    shadow-radius: ${px(strong ? 44 : 24)};

    elevation: ${strong ? 8 : 3};
  ` as ViewStyle;
};
