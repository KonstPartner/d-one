import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Root = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const Header = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'sm'),
    css`
      padding-bottom: ${toPX(theme.spacing.md)};
      border-bottom-width: ${toPX(theme.border.width.sm)};
      border-bottom-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const HeaderSide = (theme: Theme) =>
  css`
    width: ${toPX(theme.control.height.sm)};
    height: ${toPX(theme.control.height.sm)};
  ` as StyleProp<ViewStyle>;

export const Title = (theme: Theme) =>
  [
    globalStyles.Heading(theme),
    css`
      flex: 1;
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const Scroll = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const Content = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'lg'),
    css`
      padding-top: ${toPX(theme.spacing.lg)};
      padding-bottom: ${toPX(theme.spacing.lg)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Metrics = (theme: Theme) => globalStyles.Stack(theme, 'md');

export const Field = (theme: Theme) => globalStyles.Stack(theme, 'xs');

export const Dropdown = (disabled: boolean) =>
  css`
    opacity: ${disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;

export const CommentInput = (theme: Theme) =>
  css`
    height: 140px;
    min-height: 140px;
    background-color: ${theme.colors.input};
  ` as StyleProp<TextStyle>;

export const ErrorText = (theme: Theme) =>
  globalStyles.Text(theme, 'sm', 'medium', 'danger');

export const Footer = (theme: Theme) =>
  [
    globalStyles.ActionsRow(theme, 'md'),
    css`
      padding-top: ${toPX(theme.spacing.md)};
      border-top-width: ${toPX(theme.border.width.sm)};
      border-top-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Action = globalStyles.FlexItem;

export const ButtonContent = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'center', 'sm');
