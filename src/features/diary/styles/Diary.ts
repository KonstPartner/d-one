import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const OwnerContent = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const Toolbar = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'flex-end', 'sm'),
    css`
      padding-top: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CreateButton = (theme: Theme) =>
  [
    globalStyles.IconButton(theme, 'primary', 'lg'),
    css`
      border-radius: ${toPX(theme.radius.full)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const SelectionToolbar = (theme: Theme) =>
  [
    globalStyles.Surface(theme, 'card'),
    globalStyles.Rounded(theme, 'md'),
    globalStyles.Inset(theme, 'sm'),
    globalStyles.Row(theme, 'center', 'space-between', 'sm'),
    css`
      margin-top: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const SelectionCount = (theme: Theme) =>
  [
    globalStyles.Caption(theme),
    globalStyles.FlexItem,
    css`
      color: ${theme.colors.text};
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const SelectionAction = (
  theme: Theme,
  tone: 'primary' | 'danger',
  disabled: boolean = false
) =>
  [
    globalStyles.CompactButton(theme, tone, disabled),
    globalStyles.Row(theme, 'center', 'center', 'xs'),
  ] as StyleProp<ViewStyle>;

export const SelectionActionText = (theme: Theme, tone: 'primary' | 'danger') =>
  globalStyles.CompactButtonText(theme, tone);

export const CloseSelectionButton = (theme: Theme) =>
  globalStyles.IconButton(theme, 'ghost', 'sm');

export const SelectableEntry = (
  theme: Theme,
  selected: boolean,
  disabled: boolean
) =>
  [
    globalStyles.Row(theme, 'center', 'flex-start', 'sm'),
    css`
      opacity: ${disabled ? 0.55 : 1};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const SelectionIndicator = (theme: Theme, selected: boolean) =>
  css`
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${toPX(theme.radius.sm)};
    background-color: ${selected ? theme.colors.primary : theme.colors.card};
  ` as StyleProp<ViewStyle>;

export const SelectionIndicatorSlot = css`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
` as StyleProp<ViewStyle>;

export const SelectionCard = (theme: Theme, selected: boolean) =>
  [
    globalStyles.FlexItem,
    css`
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${selected ? theme.colors.primary : 'transparent'};
      border-radius: ${toPX(theme.radius.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const UnsupportedContent = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'md'),
    css`
      flex: 1;
      width: 100%;
      max-width: 520px;
      align-self: center;
      align-items: center;
      justify-content: center;
      padding-horizontal: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CenteredText = css`
  text-align: center;
` as StyleProp<TextStyle>;
