import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { toPX } from '@features/theme/model';

type MetricKey = keyof Theme['colors']['metrics'];

export const Container = (theme: Theme, metricKey: MetricKey) => {
  const colors = theme.colors.metrics[metricKey];

  return css`
    min-width: 0;
    min-height: 112px;
    flex-basis: 47%;
    flex-grow: 1;
    gap: ${toPX(theme.spacing.sm)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${colors.background};
    padding: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;
};

export const Header = (theme: Theme) =>
  css`
    min-height: 32px;
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const Label = (theme: Theme) =>
  css`
    flex: 1;
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.sm)};
    line-height: ${toPX(theme.lineHeight.sm)};
    font-weight: ${theme.weight.black};
  ` as StyleProp<TextStyle>;

export const Stepper = (theme: Theme, metricKey: MetricKey) => {
  const colors = theme.colors.metrics[metricKey];

  return css`
    min-height: 42px;
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.xs)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.input};
    padding: ${toPX(theme.spacing.xs)};
  ` as StyleProp<ViewStyle>;
};

export const StepButton = (
  theme: Theme,
  metricKey: MetricKey,
  disabled: boolean
) => {
  const colors = theme.colors.metrics[metricKey];

  return css`
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${disabled ? theme.colors.border : colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.card};
    opacity: ${disabled ? 0.45 : 1};
  ` as StyleProp<ViewStyle>;
};

export const Input = (theme: Theme, metricKey: MetricKey) =>
  css`
    flex: 1;
    min-width: 0;
    height: 34px;
    min-height: 34px;
    border-width: 0;
    background-color: transparent;
    padding: 0 ${toPX(theme.spacing.xs)};
    color: ${theme.colors.metrics[metricKey].text};
    font-size: ${toPX(theme.size.lg)};
    line-height: ${toPX(theme.lineHeight.xl)};
    font-weight: ${theme.weight.black};
  ` as StyleProp<TextStyle>;
