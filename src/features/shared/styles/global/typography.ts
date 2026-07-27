import { StyleProp, TextStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import {
  TextTone,
  ThemeLineHeight,
  ThemeSize,
  ThemeWeight,
} from '@features/shared/styles/global/types';
import { toPX } from '@features/theme/model';

const textColor = (theme: Theme, tone: TextTone) => {
  if (tone === 'muted') {
    return theme.colors.muted;
  }

  if (tone === 'primary') {
    return theme.colors.primary;
  }

  if (tone === 'danger') {
    return theme.colors.danger;
  }

  if (tone === 'success') {
    return theme.colors.success;
  }

  if (tone === 'warning') {
    return theme.colors.warning;
  }

  if (tone === 'inverse') {
    return theme.colors.white;
  }

  return theme.colors.text;
};

export const Text = (
  theme: Theme,
  size: ThemeSize = 'base',
  weight: ThemeWeight = 'regular',
  tone: TextTone = 'default',
  lineHeight: ThemeLineHeight = 'md'
) =>
  css`
    color: ${textColor(theme, tone)};
    font-size: ${toPX(theme.size[size])};
    font-weight: ${theme.weight[weight]};
    line-height: ${toPX(theme.lineHeight[lineHeight])};
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
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.medium};
    line-height: ${toPX(theme.lineHeight.sm)};
    margin-bottom: ${toPX(theme.spacing.xs)};
  ` as StyleProp<TextStyle>;
