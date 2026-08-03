import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

import { ButtonTone, ControlSize } from './types';

const buttonBackground = (
  theme: Theme,
  tone: ButtonTone,
  disabled: boolean
) => {
  if (disabled && tone === 'danger') {
    return theme.colors.shades.danger.md;
  }

  if (disabled && tone === 'success') {
    return theme.colors.shades.success.md;
  }

  if (disabled && tone === 'primary') {
    return theme.colors.shades.primary.md;
  }

  if (tone === 'danger') {
    return theme.colors.danger;
  }

  if (tone === 'success') {
    return theme.colors.success;
  }

  if (tone === 'secondary') {
    return theme.colors.input;
  }

  if (tone === 'ghost') {
    return 'transparent';
  }

  return theme.colors.primary;
};

const buttonTextColor = (
  theme: Theme,
  tone: ButtonTone,
  disabled: boolean = false
) => {
  if (disabled && tone === 'danger') {
    return theme.colors.shades.danger.text;
  }

  if (disabled && tone === 'success') {
    return theme.colors.shades.success.text;
  }

  if (disabled && tone === 'primary') {
    return theme.colors.shades.primary.text;
  }

  if (disabled) {
    return theme.colors.muted;
  }

  if (tone === 'secondary' || tone === 'ghost') {
    return theme.colors.text;
  }

  return theme.colors.white;
};

export const ControlBase = (theme: Theme) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    border-radius: ${toPX(theme.radius.md)};
    padding: ${toPX(theme.spacing.md)} ${toPX(theme.spacing.lg)};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyle>;

export const Button = (
  theme: Theme,
  tone: ButtonTone = 'primary',
  disabled: boolean = false
) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    border-radius: ${toPX(theme.radius.md)};
    padding: ${toPX(theme.spacing.md)} ${toPX(theme.spacing.lg)};
    align-items: center;
    justify-content: center;
    background-color: ${buttonBackground(theme, tone, disabled)};
    border-width: ${tone === 'secondary' ? toPX(theme.border.width.sm) : '0px'};
    border-color: ${theme.colors.border};
  ` as StyleProp<ViewStyle>;

export const ButtonText = (
  theme: Theme,
  tone: ButtonTone = 'primary',
  disabled: boolean = false
) =>
  css`
    color: ${buttonTextColor(theme, tone, disabled)};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.md)};
    text-align: center;
  ` as StyleProp<TextStyle>;

const controlSide = (theme: Theme, size: ControlSize) => {
  if (size === 'sm') {
    return theme.control.height.sm;
  }

  if (size === 'lg') {
    return theme.control.height.lg;
  }

  return theme.control.height.md;
};

export const IconButton = (
  theme: Theme,
  tone: ButtonTone = 'secondary',
  size: ControlSize = 'md',
  disabled: boolean = false
) => {
  const side = controlSide(theme, size);

  return css`
    width: ${toPX(side)};
    height: ${toPX(side)};
    border-radius: ${toPX(theme.radius.md)};
    border-width: ${tone === 'ghost' ? '0px' : toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    background-color: ${buttonBackground(theme, tone, disabled)};
    align-items: center;
    justify-content: center;
    opacity: ${disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;
};

export const Chip = (
  theme: Theme,
  selected: boolean = false,
  tone: ButtonTone = 'primary'
) =>
  css`
    min-height: ${toPX(theme.control.height.sm)};
    padding: ${toPX(theme.spacing.sm)} ${toPX(theme.spacing.md)};
    border-radius: ${toPX(theme.radius.full)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${selected
      ? buttonBackground(theme, tone, false)
      : theme.colors.border};
    background-color: ${selected
      ? buttonBackground(theme, tone, false)
      : theme.colors.card};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyle>;

export const ChipText = (theme: Theme, selected: boolean = false) =>
  css`
    color: ${selected ? theme.colors.white : theme.colors.text};
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.sm)};
  ` as StyleProp<TextStyle>;

export const CompactButton = (
  theme: Theme,
  tone: ButtonTone = 'primary',
  disabled: boolean = false
) =>
  css`
    min-height: ${toPX(theme.control.height.sm)};
    border-radius: ${toPX(theme.radius.sm)};
    padding: ${toPX(theme.spacing.sm)} ${toPX(theme.spacing.md)};
    align-items: center;
    justify-content: center;
    background-color: ${buttonBackground(theme, tone, disabled)};
  ` as StyleProp<ViewStyle>;

export const CompactButtonText = (theme: Theme, tone: ButtonTone = 'primary') =>
  css`
    color: ${buttonTextColor(theme, tone)};
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.sm)};
    text-align: center;
  ` as StyleProp<TextStyle>;
