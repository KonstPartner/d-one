import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Fill = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const ErrorContent = [
  globalStyles.CenterContent,
  Fill,
] as StyleProp<ViewStyle>;

export const EmptyContent = (theme: Theme) =>
  [
    globalStyles.CenterContent,
    globalStyles.Stack(theme, 'sm'),
    Fill,
  ] as StyleProp<ViewStyle>;

export const EmptyTitle = (theme: Theme) => globalStyles.Subheading(theme);

export const EmptyDescription = (theme: Theme) =>
  [
    globalStyles.Body(theme),
    css`
      color: ${theme.colors.muted};
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const ListContent = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'md'),
    css`
      padding-top: ${toPX(theme.spacing.md)};
      padding-bottom: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const ListFooter = (theme: Theme) =>
  css`
    padding-top: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;
