import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type ActionTone = 'primary' | 'danger';

const getActionBackground = (
  theme: Theme,
  tone: ActionTone,
  disabled: boolean
): string => {
  if (disabled) {
    return theme.colors.muted;
  }

  return tone === 'danger' ? theme.colors.danger : theme.colors.primary;
};

const CompactButton = (theme: Theme, tone: ActionTone, disabled: boolean) =>
  css`
    min-height: ${ss.px(theme.control.height.sm)};
    padding: ${ss.px(theme.spacing.sm)} ${ss.px(theme.spacing.md)};
    align-items: center;
    justify-content: center;
    border-radius: ${ss.px(theme.radius.sm)};
    background-color: ${getActionBackground(theme, tone, disabled)};
    opacity: ${disabled ? 0.7 : 1};
  ` as ViewStyle;

const CompactButtonText = (theme: Theme) =>
  css`
    color: ${theme.colors.white};
    font-size: ${ss.px(theme.size.sm)};
    font-weight: ${theme.weight.bold};
    line-height: ${ss.px(theme.lineHeight.sm)};
    text-align: center;
  ` as TextStyle;

const GhostIconButton = (theme: Theme) =>
  css`
    width: ${ss.px(theme.control.height.sm)};
    height: ${ss.px(theme.control.height.sm)};
    align-items: center;
    justify-content: center;
    border-width: ${ss.px(theme.border.width.none)};
    border-radius: ${ss.px(theme.radius.md)};
    background-color: transparent;
  ` as ViewStyle;

export const OwnerContent = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const SyncProgress = (theme: Theme) =>
  [
    ss.Surface(theme, 'card'),
    ss.Rounded(theme, 'md'),
    ss.Inset(theme, 'sm'),
    ss.Row(theme, 'center', 'flex-start', 'sm'),
    css`
      margin-top: ${ss.px(theme.spacing.sm)};
      border-width: ${ss.px(theme.border.width.sm)};
      border-color: ${theme.colors.shades.primary.lg};
    ` as ViewStyle,
  ] as StyleProp<ViewStyle>;

export const SyncProgressText = (theme: Theme) =>
  [
    ss.Caption(theme),
    css`
      color: ${theme.colors.text};
      font-weight: ${theme.weight.heavy};
    ` as TextStyle,
  ] as StyleProp<TextStyle>;

export const Toolbar = (theme: Theme) =>
  [
    ss.Row(theme, 'center', 'flex-end', 'sm'),
    css`
      padding-top: ${ss.px(theme.spacing.sm)};
    ` as ViewStyle,
  ] as StyleProp<ViewStyle>;

export const SelectionToolbar = (theme: Theme) =>
  [
    ss.Surface(theme, 'card'),
    ss.Rounded(theme, 'md'),
    ss.Inset(theme, 'sm'),
    ss.Row(theme, 'center', 'space-between', 'sm'),
    css`
      flex-wrap: wrap;
      margin-top: ${ss.px(theme.spacing.sm)};
    ` as ViewStyle,
  ] as StyleProp<ViewStyle>;

export const SelectionCount = (theme: Theme) =>
  [
    ss.Caption(theme),
    ss.FlexItem,
    css`
      min-width: 72px;
      color: ${theme.colors.text};
      text-align: center;
    ` as TextStyle,
  ] as StyleProp<TextStyle>;

export const SelectionAction = (
  theme: Theme,
  tone: ActionTone,
  disabled = false
) =>
  [
    CompactButton(theme, tone, disabled),
    ss.Row(theme, 'center', 'center', 'xs'),
  ] as StyleProp<ViewStyle>;

export const SelectionActionText = (theme: Theme) => CompactButtonText(theme);

export const CloseSelectionButton = (theme: Theme) => GhostIconButton(theme);

export const SelectableEntry = (
  theme: Theme,
  selected: boolean,
  disabled: boolean
) =>
  [
    ss.Row(theme, 'center', 'flex-start', 'sm'),
    css`
      opacity: ${disabled ? 0.55 : 1};
    ` as ViewStyle,
  ] as StyleProp<ViewStyle>;

export const SelectionIndicator = (theme: Theme, selected: boolean) =>
  css`
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-width: ${ss.px(theme.border.width.sm)};
    border-color: ${selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${ss.px(theme.radius.sm)};
    background-color: ${selected ? theme.colors.primary : theme.colors.card};
  ` as StyleProp<ViewStyle>;

export const SelectionIndicatorSlot = css`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
` as StyleProp<ViewStyle>;

export const SelectionCard = (theme: Theme, selected: boolean) =>
  [
    ss.FlexItem,
    css`
      border-width: ${ss.px(theme.border.width.sm)};
      border-color: ${selected ? theme.colors.primary : 'transparent'};
      border-radius: ${ss.px(theme.radius.md)};
    ` as ViewStyle,
  ] as StyleProp<ViewStyle>;
