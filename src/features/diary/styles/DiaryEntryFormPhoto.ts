import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Root = (theme: Theme, disabled: boolean) =>
  css`
    min-width: 0;
    gap: ${toPX(theme.spacing.sm)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.card};
    padding: ${toPX(theme.spacing.sm)};
    opacity: ${disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;

export const Preview = (theme: Theme) =>
  css`
    position: relative;
    width: 100%;
    aspect-ratio: 1.7777778;
    overflow: hidden;
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyle>;

export const Image = css`
  width: 100%;
  height: 100%;
` as StyleProp<ImageStyle>;

export const EmptyState = (theme: Theme) =>
  [
    globalStyles.CenterContent,
    globalStyles.Stack(theme, 'sm'),
    css`
      flex: 1;
      padding: ${toPX(theme.spacing.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const LoadingOverlay = (theme: Theme) =>
  [
    globalStyles.CenterContent,
    css`
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: ${theme.colors.card};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Actions = (theme: Theme) => globalStyles.ActionsRow(theme, 'sm');

export const Action = globalStyles.FlexItem;

export const ButtonContent = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'center', 'sm');
