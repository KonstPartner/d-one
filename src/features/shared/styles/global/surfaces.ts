import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import {
  SurfaceShadowLevel,
  SurfaceTone,
  ThemeRadius,
  ThemeSpacing,
} from '@features/shared/styles/global/types';
import { toPX } from '@features/theme/model';

const surfaceBackground = (theme: Theme, tone: SurfaceTone) => {
  if (tone === 'input') {
    return theme.colors.input;
  }

  if (tone === 'background') {
    return theme.colors.bg;
  }

  if (tone === 'primarySoft') {
    return theme.colors.shades.primary.sm;
  }

  return theme.colors.card;
};

export const Surface = (
  theme: Theme,
  tone: SurfaceTone = 'card',
  withBorder: boolean = true
) =>
  css`
    background-color: ${surfaceBackground(theme, tone)};
    border-width: ${withBorder ? toPX(theme.border.width.sm) : '0px'};
    border-color: ${theme.colors.border};
  ` as StyleProp<ViewStyle>;

export const Rounded = (theme: Theme, radius: ThemeRadius = 'lg') =>
  css`
    border-radius: ${toPX(theme.radius[radius])};
  ` as StyleProp<ViewStyle>;

export const Inset = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding: ${toPX(theme.spacing[size])};
  ` as StyleProp<ViewStyle>;

export const InsetX = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-left: ${toPX(theme.spacing[size])};
    padding-right: ${toPX(theme.spacing[size])};
  ` as StyleProp<ViewStyle>;

export const InsetY = (theme: Theme, size: ThemeSpacing = 'lg') =>
  css`
    padding-top: ${toPX(theme.spacing[size])};
    padding-bottom: ${toPX(theme.spacing[size])};
  ` as StyleProp<ViewStyle>;

export const CardContainer = (
  theme: Theme,
  padding: ThemeSpacing = 'lg',
  radius: ThemeRadius = 'lg'
) =>
  [
    Surface(theme),
    Rounded(theme, radius),
    Inset(theme, padding),
  ] as StyleProp<ViewStyle>;

export const FieldContainer = (theme: Theme, isFocused: boolean = false) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    padding: ${toPX(theme.spacing.md)} ${toPX(theme.spacing.lg)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${isFocused ? theme.colors.primary : theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${isFocused ? theme.colors.card : theme.colors.input};
  ` as StyleProp<ViewStyle>;

export const Shadow = (theme: Theme, level: SurfaceShadowLevel = 'soft') => {
  const isStrong = level === 'strong';

  return css`
    shadow-color: ${theme.colors.black};
    shadow-offset: 0px ${toPX(isStrong ? 18 : 10)};
    shadow-opacity: ${theme.mode === 'dark'
      ? isStrong
        ? 0.42
        : 0.32
      : isStrong
        ? 0.08
        : 0.055};
    shadow-radius: ${toPX(isStrong ? 44 : 24)};
    elevation: ${isStrong ? 8 : 3};
  ` as StyleProp<ViewStyle>;
};
