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

export const Title = (theme: Theme) => globalStyles.Heading(theme);

export const Scroll = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const Content = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'md'),
    css`
      padding-top: ${toPX(theme.spacing.md)};
      padding-bottom: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const SectionCard = (theme: Theme) =>
  [
    globalStyles.Surface(theme, 'card'),
    globalStyles.Rounded(theme, 'lg'),
    globalStyles.Inset(theme, 'md'),
    globalStyles.Shadow(theme, 'soft'),
  ] as StyleProp<ViewStyle>;

export const SectionHeader = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'sm'),
    css`
      margin-bottom: ${toPX(theme.spacing.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const SectionTitle = (theme: Theme) => globalStyles.Subheading(theme);

export const SectionTitleWithGap = (theme: Theme) =>
  [
    SectionTitle(theme),
    css`
      margin-bottom: ${toPX(theme.spacing.md)};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const TextAction = (theme: Theme, disabled = false) =>
  css`
    min-height: ${toPX(theme.control.height.sm)};
    justify-content: center;
    padding-horizontal: ${toPX(theme.spacing.sm)};
    opacity: ${disabled ? 0.38 : 1};
  ` as StyleProp<ViewStyle>;

export const TextActionLabel = (theme: Theme, disabled = false) =>
  [
    globalStyles.Caption(theme),
    css`
      color: ${disabled ? theme.colors.muted : theme.colors.primary};
      font-weight: ${theme.weight.bold};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const DateBoundaries = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'stretch', 'space-between', 'sm'),
    css`
      margin-bottom: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const DateBoundary = (theme: Theme, active: boolean) =>
  css`
    min-height: 52px;
    flex: 1;
    flex-basis: 0px;
    flex-direction: row;
    align-items: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${active ? theme.colors.primary : theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${active
      ? theme.colors.shades.primary.sm
      : theme.colors.input};
    padding: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const DateBoundaryContent = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    globalStyles.Stack(theme, 'xs'),
  ] as StyleProp<ViewStyle>;

export const DateBoundaryLabel = (theme: Theme) =>
  [
    globalStyles.Caption(theme),
    css`
      color: ${theme.colors.muted};
      font-weight: ${theme.weight.bold};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const DateBoundaryValue = (theme: Theme) =>
  [
    globalStyles.Body(theme),
    css`
      color: ${theme.colors.text};
      font-weight: ${theme.weight.bold};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const ClearBoundaryButton = (theme: Theme) =>
  css`
    width: ${toPX(theme.control.height.sm)};
    height: ${toPX(theme.control.height.sm)};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyle>;

export const RangeTrack = (theme: Theme) =>
  css`
    position: relative;
    height: 22px;
    margin-top: ${toPX(theme.spacing.md)};
    margin-horizontal: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const RangeRail = (theme: Theme, color: string): ViewStyle => ({
  position: 'absolute',
  top: 7,
  bottom: 7,
  left: '14%',
  right: '14%',
  borderRadius: theme.radius.full,
  backgroundColor: color,
  opacity: theme.mode === 'dark' ? 0.32 : 0.24,
});

export const RangeNullSlot = (
  theme: Theme,
  boundary: 'min' | 'max',
  color: string
): ViewStyle => ({
  position: 'absolute',
  top: 3,
  ...(boundary === 'min'
    ? { left: 0, marginLeft: -8 }
    : { right: 0, marginRight: -8 }),
  width: 16,
  height: 16,
  borderWidth: 2,
  borderColor: color,
  borderRadius: 999,
  backgroundColor: theme.colors.card,
  opacity: theme.mode === 'dark' ? 0.72 : 0.56,
});

export const RangeFill = (theme: Theme, color: string): ViewStyle => ({
  position: 'absolute',
  top: 7,
  bottom: 7,
  borderRadius: theme.radius.full,
  backgroundColor: color,
});

export const RangeThumb = (theme: Theme, color: string): ViewStyle => ({
  position: 'absolute',
  top: 0,
  width: 22,
  height: 22,
  marginLeft: -11,
  borderWidth: 3,
  borderColor: theme.colors.card,
  borderRadius: 999,
  backgroundColor: color,
  shadowColor: theme.colors.black,
  shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.18,
  shadowRadius: 5,
  elevation: 2,
});

export const RangeValueBubble = (
  theme: Theme,
  color: string
): StyleProp<ViewStyle> => ({
  position: 'absolute',
  top: -34,
  minWidth: 34,
  height: 26,
  marginLeft: -17,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: theme.spacing.xs,
  borderRadius: theme.radius.md,
  backgroundColor: color,
  shadowColor: theme.colors.black,
  shadowOpacity: theme.mode === 'dark' ? 0.34 : 0.16,
  shadowRadius: 4,
  elevation: 2,
});

export const RangeValueBubbleText = (theme: Theme) =>
  [
    globalStyles.Caption(theme),
    css`
      color: ${theme.colors.white};
      font-weight: ${theme.weight.bold};
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const RangeScale = (theme: Theme) =>
  css`
    position: relative;
    height: ${toPX(theme.size.md)};
    margin-top: ${toPX(theme.spacing.md)};
    margin-bottom: ${toPX(theme.spacing.sm)};
    margin-horizontal: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const RangeScaleText = (
  theme: Theme,
  position: number
): StyleProp<TextStyle> => {
  const edgePosition: TextStyle =
    position === 0
      ? { left: 0 }
      : position === 100
        ? { right: 0 }
        : {
            left: `${position}%` as `${number}%`,
            width: theme.spacing.xl,
            marginLeft: -theme.spacing.xl / 2,
            textAlign: 'center',
          };

  return [
    globalStyles.Caption(theme),
    {
      position: 'absolute',
      color: theme.colors.muted,
    },
    edgePosition,
  ];
};

export const RangeInputs = (theme: Theme) =>
  globalStyles.Row(theme, 'flex-end', 'space-between', 'sm');

export const RangeInputColumn = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    globalStyles.Stack(theme, 'xs'),
  ] as StyleProp<ViewStyle>;

export const FieldLabel = (theme: Theme) => globalStyles.Label(theme);

export const RangeInput = (theme: Theme, invalid: boolean) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${invalid ? theme.colors.danger : theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.input};
    color: ${theme.colors.text};
    padding-horizontal: ${toPX(theme.spacing.md)};
    font-size: ${toPX(theme.size.md)};
  ` as StyleProp<TextStyle>;

export const RangeResetButton = (theme: Theme, disabled = false) =>
  [
    globalStyles.IconButton(theme, 'secondary', 'md'),
    disabled && ({ opacity: 0.38 } as ViewStyle),
  ] as StyleProp<ViewStyle>;

export const ErrorText = (theme: Theme) =>
  [
    globalStyles.Caption(theme),
    css`
      margin-top: ${toPX(theme.spacing.sm)};
      color: ${theme.colors.danger};
      font-weight: ${theme.weight.bold};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const DropdownField = (theme: Theme, opened: boolean) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'sm'),
    css`
      min-height: ${toPX(theme.control.height.md)};
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${opened ? theme.colors.primary : theme.colors.border};
      border-radius: ${toPX(theme.radius.md)};
      background-color: ${theme.colors.input};
      padding-horizontal: ${toPX(theme.spacing.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const DropdownFieldText = (theme: Theme) =>
  [
    globalStyles.Body(theme),
    globalStyles.FlexItem,
    css`
      color: ${theme.colors.text};
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const CheckList = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'xs'),
    css`
      margin-top: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CheckRow = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'flex-start', 'sm'),
    css`
      min-height: ${toPX(theme.control.height.sm)};
      padding-vertical: ${toPX(theme.spacing.xs)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Checkbox = (theme: Theme, selected: boolean) =>
  css`
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${toPX(theme.radius.sm)};
    background-color: ${selected ? theme.colors.primary : theme.colors.input};
  ` as StyleProp<ViewStyle>;

export const CheckLabel = (theme: Theme) => globalStyles.Body(theme);

export const PresenceSwitch = (theme: Theme) =>
  globalStyles.Row(theme, 'stretch', 'space-between', 'xs');

export const PresenceOption = (theme: Theme, selected: boolean) =>
  css`
    min-height: ${toPX(theme.control.height.sm)};
    flex: 1;
    flex-basis: 0px;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${toPX(theme.radius.sm)};
    background-color: ${selected ? theme.colors.primary : theme.colors.input};
    padding: ${toPX(theme.spacing.xs)};
  ` as StyleProp<ViewStyle>;

export const PresenceOptionText = (theme: Theme, selected: boolean) =>
  [
    globalStyles.Caption(theme),
    css`
      color: ${selected ? theme.colors.white : theme.colors.text};
      font-weight: ${theme.weight.bold};
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const ApplyError = (theme: Theme) =>
  [
    globalStyles.Caption(theme),
    css`
      color: ${theme.colors.danger};
      font-weight: ${theme.weight.bold};
      text-align: center;
    ` as StyleProp<TextStyle>,
  ] as StyleProp<TextStyle>;

export const Footer = (theme: Theme) =>
  [
    globalStyles.ActionsRow(theme, 'md'),
    css`
      padding-top: ${toPX(theme.spacing.md)};
      border-top-width: ${toPX(theme.border.width.sm)};
      border-top-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const FooterAction = (disabled = false) =>
  [
    globalStyles.FlexItem,
    disabled && ({ opacity: 0.42 } as ViewStyle),
  ] as StyleProp<ViewStyle>;

export const ApplyButtonContent = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'center', 'xs');
