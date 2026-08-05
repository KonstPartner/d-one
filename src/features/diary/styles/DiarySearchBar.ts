import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Root = {
  position: 'relative',
  zIndex: 20,
  flex: 1,
  minWidth: 0,
} as StyleProp<ViewStyle>;

export const TopRow = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'space-between', 'sm');

export const InputShell = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    globalStyles.Row(theme, 'center', 'flex-start', 'sm'),
    css`
      min-height: ${toPX(theme.control.height.lg)};
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${theme.colors.border};
      border-radius: ${toPX(theme.radius.lg)};
      background-color: ${theme.colors.input};
      padding-horizontal: ${toPX(theme.spacing.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Input = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    css`
      min-height: ${toPX(theme.control.height.lg)};
      color: ${theme.colors.text};
      font-size: ${toPX(theme.size.md)};
      padding-vertical: 0;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const ClearButton = (theme: Theme) =>
  css`
    width: ${toPX(theme.control.height.sm)};
    height: ${toPX(theme.control.height.sm)};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyle>;

export const FieldSelector = (theme: Theme, opened: boolean) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'xs'),
    css`
      min-height: ${toPX(theme.control.height.lg)};
      margin-top: ${toPX(theme.spacing.xs)};
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${opened ? theme.colors.primary : theme.colors.border};
      border-radius: ${toPX(theme.radius.md)};
      background-color: ${theme.colors.input};
      padding-horizontal: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const FieldSelectorText = (theme: Theme) =>
  [
    globalStyles.Body(theme),
    globalStyles.FlexItem,
    css`
      color: ${theme.colors.muted};
      font-weight: ${theme.weight.bold};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const Options = (theme: Theme) =>
  [
    globalStyles.Surface(theme, 'card'),
    globalStyles.Rounded(theme, 'md'),
    globalStyles.Shadow(theme, 'soft'),
    css`
      position: absolute;
      z-index: 50;
      top: ${toPX(
        theme.control.height.lg + theme.spacing.xs + theme.control.height.lg
      )};
      left: 0;
      right: 0;
      padding: ${toPX(theme.spacing.xs)};
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Option = (theme: Theme, selected: boolean) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'sm'),
    css`
      min-height: ${toPX(theme.control.height.lg)};
      border-radius: ${toPX(theme.radius.sm)};
      background-color: ${selected
        ? theme.colors.shades.primary.sm
        : theme.colors.card};
      padding-horizontal: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const OptionText = (theme: Theme, selected: boolean) =>
  [
    globalStyles.Body(theme),
    css`
      color: ${selected ? theme.colors.primary : theme.colors.text};
      font-weight: ${selected ? theme.weight.bold : 400};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;
