import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

export type IconButtonTone = 'primary' | 'secondary' | 'success' | 'danger';

export type IconButtonVariant = 'solid' | 'outline' | 'ghost';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export const Root = styled.Pressable`
  flex-shrink: 0;

  align-items: center;
  justify-content: center;
`;

const getToneColor = (theme: Theme, tone: IconButtonTone): string => {
  switch (tone) {
    case 'success':
      return theme.colors.success;

    case 'danger':
      return theme.colors.danger;

    case 'secondary':
      return theme.colors.text;

    default:
      return theme.colors.primary;
  }
};

const getBackgroundColor = (
  theme: Theme,
  tone: IconButtonTone,
  variant: IconButtonVariant
): string => {
  if (variant === 'ghost') {
    return 'transparent';
  }

  if (variant === 'outline') {
    return theme.colors.card;
  }

  if (tone === 'secondary') {
    return theme.colors.input;
  }

  return getToneColor(theme, tone);
};

const getBorderColor = (
  theme: Theme,
  tone: IconButtonTone,
  variant: IconButtonVariant
): string => {
  if (variant !== 'outline') {
    return 'transparent';
  }

  if (tone === 'secondary') {
    return theme.colors.border;
  }

  return getToneColor(theme, tone);
};

export const getIconButtonForegroundColor = (
  theme: Theme,
  tone: IconButtonTone,
  variant: IconButtonVariant
): string => {
  if (variant === 'solid' && tone !== 'secondary') {
    return theme.colors.white;
  }

  return getToneColor(theme, tone);
};

export const getIconButtonStyle = (
  theme: Theme,
  tone: IconButtonTone,
  variant: IconButtonVariant,
  size: IconButtonSize
): ViewStyle => {
  const dimension = theme.control.height[size];

  return {
    width: dimension,
    height: dimension,
    minWidth: dimension,
    minHeight: dimension,

    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,

    borderWidth: variant === 'outline' ? theme.border.width.sm : 0,

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
