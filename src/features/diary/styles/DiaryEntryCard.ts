import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { SelectDropdownTone } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

type MetricKey = keyof Theme['colors']['metrics'];

export const Card = (theme: Theme, pendingDelete: boolean) =>
  [
    globalStyles.Surface(theme, pendingDelete ? 'input' : 'card'),
    globalStyles.Rounded(theme, 'md'),
    css`
      overflow: hidden;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Pressed = css`
  opacity: 0.72;
` as StyleProp<ViewStyle>;

export const Body = (theme: Theme) =>
  [
    globalStyles.Inset(theme, 'md'),
    globalStyles.Stack(theme, 'sm'),
  ] as StyleProp<ViewStyle>;

export const Header = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'space-between', 'sm');

export const Time = (theme: Theme) =>
  [
    globalStyles.FlexItem,
    globalStyles.Row(theme, 'center', 'flex-start', 'sm'),
  ] as StyleProp<ViewStyle>;

export const TimeText = (theme: Theme) =>
  css`
    flex: 1;
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.base)};
    line-height: ${toPX(theme.lineHeight.md)};
    font-weight: ${theme.weight.black};
  ` as StyleProp<TextStyle>;

export const MealRelation = (theme: Theme, tone: SelectDropdownTone) =>
  [
    globalStyles.Rounded(theme, 'full'),
    globalStyles.InsetX(theme, 'sm'),
    globalStyles.InsetY(theme, 'xs'),
    globalStyles.Row(theme, 'center', 'flex-start', 'xs'),
    css`
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${theme.colors.shades[tone].lg};
      background-color: ${theme.colors.shades[tone].sm};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const MealRelationText = (theme: Theme, tone: SelectDropdownTone) =>
  css`
    color: ${theme.colors[tone]};
    font-size: ${toPX(theme.size.xs)};
    line-height: ${toPX(theme.lineHeight.xs)};
    font-weight: ${theme.weight.heavy};
  ` as StyleProp<TextStyle>;

export const Metrics = (theme: Theme) =>
  css`
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const Metric = (theme: Theme, key: MetricKey) => {
  const colors = theme.colors.metrics[key];

  return css`
    min-width: 132px;
    min-height: 52px;
    flex-basis: 47%;
    flex-grow: 1;
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.sm)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${colors.background};
    padding: ${toPX(theme.spacing.sm)} ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;
};

export const MetricIcon = css`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const MetricValue = (theme: Theme, key: MetricKey) =>
  css`
    color: ${theme.colors.metrics[key].text};
    font-size: ${toPX(theme.size.lg)};
    line-height: ${toPX(theme.lineHeight.xl)};
    font-weight: ${theme.weight.black};
  ` as StyleProp<TextStyle>;

export const Status = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'flex-start', 'xs'),
    globalStyles.InsetX(theme, 'md'),
    globalStyles.InsetY(theme, 'sm'),
    css`
      border-top-width: ${toPX(theme.border.width.sm)};
      border-top-color: ${theme.colors.border};
      background-color: ${theme.colors.input};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;
