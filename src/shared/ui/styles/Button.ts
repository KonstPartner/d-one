import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

export type ButtonTone = 'primary' | 'secondary' | 'success' | 'danger';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export const Root = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const getToneColor = (theme: Theme, tone: ButtonTone): string => {
  switch (tone) {
    case 'danger':
      return theme.colors.danger;

    case 'success':
      return theme.colors.success;

    case 'secondary':
      return theme.colors.text;

    default:
      return theme.colors.primary;
  }
};

const getSolidBackground = (
  theme: Theme,
  tone: ButtonTone,
  disabled: boolean
): string => {
  if (tone === 'secondary') {
    return theme.colors.input;
  }

  if (tone === 'danger') {
    return disabled ? theme.colors.shades.danger.md : theme.colors.danger;
  }

  if (tone === 'success') {
    return disabled ? theme.colors.shades.success.md : theme.colors.success;
  }

  return disabled ? theme.colors.shades.primary.md : theme.colors.primary;
};

export const getButtonForegroundColor = (
  theme: Theme,
  tone: ButtonTone,
  variant: ButtonVariant,
  disabled: boolean
): string => {
  if (variant === 'outline' || variant === 'ghost') {
    return disabled ? theme.colors.muted : getToneColor(theme, tone);
  }

  if (tone === 'secondary') {
    return disabled ? theme.colors.muted : theme.colors.text;
  }

  if (tone === 'danger') {
    return disabled ? theme.colors.shades.danger.text : theme.colors.white;
  }

  if (tone === 'success') {
    return disabled ? theme.colors.shades.success.text : theme.colors.white;
  }

  return disabled ? theme.colors.shades.primary.text : theme.colors.white;
};

const getHeight = (theme: Theme, size: ButtonSize): number => {
  return theme.control.height[size];
};

const getHorizontalPadding = (theme: Theme, size: ButtonSize): number => {
  switch (size) {
    case 'sm':
      return theme.spacing.md;

    case 'lg':
      return theme.spacing.xl;

    default:
      return theme.spacing.lg;
  }
};

export const getButtonStyle = (
  theme: Theme,
  tone: ButtonTone,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): ViewStyle => {
  const isSecondarySolid = tone === 'secondary' && variant === 'solid';

  const hasBorder = variant === 'outline' || isSecondarySolid;

  const toneColor = getToneColor(theme, tone);

  return {
    minHeight: getHeight(theme, size),

    paddingHorizontal: getHorizontalPadding(theme, size),

    paddingVertical: theme.spacing.sm,

    borderRadius: size === 'sm' ? theme.radius.sm : theme.radius.md,

    borderWidth: hasBorder ? theme.border.width.sm : 0,

    borderColor:
      variant === 'outline'
        ? tone === 'secondary'
          ? theme.colors.border
          : toneColor
        : isSecondarySolid
          ? theme.colors.border
          : 'transparent',

    backgroundColor:
      variant === 'solid'
        ? getSolidBackground(theme, tone, disabled)
        : 'transparent',

    opacity:
      disabled && (variant !== 'solid' || tone === 'secondary') ? 0.55 : 1,
  };
};

export const getSpinnerSize = (size: ButtonSize): number => {
  switch (size) {
    case 'sm':
      return 16;

    case 'lg':
      return 20;

    default:
      return 18;
  }
};
