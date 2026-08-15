import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import { ButtonTone } from './Button';

export type IconButtonVariant = 'solid' | 'outline' | 'ghost';

export type IconButtonSize = 'sm' | 'md' | 'lg';

const getToneColor = (theme: Theme, tone: ButtonTone): string => {
  switch (tone) {
    case 'success':
      return theme.colors.success;

    case 'danger':
      return theme.colors.danger;

    case 'warning':
      return theme.colors.warning;

    case 'muted':
    case 'card':
    case 'input':
      return theme.colors.text;

    default:
      return theme.colors.primary;
  }
};

const getBackgroundColor = (
  theme: Theme,
  tone: ButtonTone,
  variant: IconButtonVariant
): string => {
  if (variant === 'ghost') {
    return 'transparent';
  }

  if (variant === 'outline') {
    return theme.colors.card;
  }

  switch (tone) {
    case 'muted':
    case 'input':
      return theme.colors.input;

    case 'card':
      return theme.colors.card;

    default:
      return getToneColor(theme, tone);
  }
};

const getBorderColor = (
  theme: Theme,
  tone: ButtonTone,
  variant: IconButtonVariant
): string => {
  if (variant === 'ghost') {
    return 'transparent';
  }

  if (
    variant === 'outline' ||
    tone === 'muted' ||
    tone === 'input' ||
    tone === 'card'
  ) {
    return theme.colors.border;
  }

  return 'transparent';
};

export const getIconButtonForegroundColor = (
  theme: Theme,
  tone: ButtonTone,
  variant: IconButtonVariant
): string => {
  if (
    variant === 'solid' &&
    tone !== 'muted' &&
    tone !== 'input' &&
    tone !== 'card'
  ) {
    return theme.colors.white;
  }

  return getToneColor(theme, tone);
};

export const getIconButtonStyle = (
  theme: Theme,
  tone: ButtonTone,
  variant: IconButtonVariant,
  size: IconButtonSize
): ViewStyle => {
  const dimension = theme.control.height[size];

  return {
    width: dimension,
    height: dimension,

    minWidth: dimension,
    minHeight: dimension,

    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,

    borderWidth: variant === 'ghost' ? 0 : theme.border.width.sm,

    borderColor: getBorderColor(theme, tone, variant),

    borderRadius: size === 'lg' ? theme.radius.xl : theme.radius.lg,

    backgroundColor: getBackgroundColor(theme, tone, variant),
  };
};

export const getIconButtonIconSize = (
  theme: Theme,
  size: IconButtonSize
): number => {
  switch (size) {
    case 'sm':
      return theme.size.base;

    case 'lg':
      return 26;

    default:
      return theme.size.md;
  }
};

export const getIconStyle = (size: number): TextStyle => ({
  width: size,
  height: size,

  lineHeight: size,

  textAlign: 'center',
  textAlignVertical: 'center',

  includeFontPadding: false,
});
