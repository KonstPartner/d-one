import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

import { px } from './toPX';
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
    font-size: ${px(theme.size[size])};
    font-weight: ${theme.weight[weight]};
    line-height: ${px(theme.lineHeight[lineHeight])};
  ` as TextStyle;

export const Heading = (theme: Theme) =>
  css`
    ${Text(theme, 'lg', 'semibold', 'default', 'xl')};
  ` as TextStyle;

export const Subheading = (theme: Theme) =>
  css`
    ${Text(theme, 'md', 'semibold', 'default', 'lg')};
  ` as TextStyle;

export const Body = (theme: Theme) =>
  css`
    ${Text(theme, 'base', 'regular', 'default', 'md')};
  ` as TextStyle;

export const Caption = (theme: Theme) =>
  css`
    ${Text(theme, 'sm', 'medium', 'muted', 'sm')};
  ` as TextStyle;

export const Label = (theme: Theme) =>
  css`
    ${Text(theme, 'sm', 'medium', 'muted', 'sm')};

    margin-bottom: ${px(theme.spacing.xs)};
  ` as TextStyle;
