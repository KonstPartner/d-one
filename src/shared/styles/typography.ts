import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle } from 'react-native';

import type {
  TextTone,
  ThemeLineHeight,
  ThemeSize,
  ThemeWeight,
} from './types';

const getTextColor = (theme: Theme, tone: TextTone): string => {
  switch (tone) {
    case 'muted':
      return theme.colors.muted;

    case 'primary':
      return theme.colors.primary;

    case 'danger':
      return theme.colors.danger;

    case 'success':
      return theme.colors.success;

    case 'warning':
      return theme.colors.warning;

    case 'inverse':
      return theme.colors.white;

    default:
      return theme.colors.text;
  }
};

export const Text = (
  theme: Theme,
  size: ThemeSize = 'base',
  weight: ThemeWeight = 'regular',
  tone: TextTone = 'default',
  lineHeight: ThemeLineHeight = 'md'
) =>
  css`
    color: ${getTextColor(theme, tone)};

    font-size: ${theme.size[size]}px;

    font-weight: ${theme.weight[weight]};

    line-height: ${theme.lineHeight[lineHeight]}px;
  ` as StyleProp<TextStyle>;

export const Heading = (theme: Theme) =>
  Text(theme, 'lg', 'semibold', 'default', 'xl');

export const Subheading = (theme: Theme) =>
  Text(theme, 'md', 'semibold', 'default', 'lg');

export const Body = (theme: Theme) =>
  Text(theme, 'base', 'regular', 'default', 'md');

export const Caption = (theme: Theme) =>
  Text(theme, 'sm', 'medium', 'muted', 'sm');

export const Label = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};

    font-size: ${theme.size.sm}px;

    font-weight: ${theme.weight.medium};

    line-height: ${theme.lineHeight.sm}px;

    margin-bottom: ${theme.spacing.xs}px;
  ` as StyleProp<TextStyle>;
