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
    globalStyles.Stack(theme, 'md'),
    css`
      padding-top: ${toPX(theme.spacing.lg)};
      padding-bottom: ${toPX(theme.spacing['2xl'])};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Metrics = (theme: Theme) =>
  css`
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const MetaField = (theme: Theme, disabled = false) =>
  css`
    min-width: 0;
    flex-direction: row;
    align-items: flex-start;
    gap: ${toPX(theme.spacing.sm)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.card};
    padding: ${toPX(theme.spacing.sm)};
    opacity: ${disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;

export const MetaIcon = (
  theme: Theme,
  backgroundColor: string,
  borderColor: string
) =>
  css`
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${borderColor};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${backgroundColor};
  ` as StyleProp<ViewStyle>;

export const MealRelationIcon = css`
  align-self: center;
` as StyleProp<ViewStyle>;

export const MetaContent = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    globalStyles.Stack(theme, 'xs'),
  ] as StyleProp<ViewStyle>;

export const CommentField = (theme: Theme, disabled: boolean) =>
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

export const CommentHeader = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'flex-start', 'sm');

export const CommentInput = (theme: Theme) =>
  css`
    height: 120px;
    min-height: 120px;
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
