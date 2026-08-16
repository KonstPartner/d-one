import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

import * as ss from '@shared/styles';

type DiaryMetricKey = keyof Theme['colors']['metrics'];

type MetricProps = {
  $metricKey: DiaryMetricKey;
};

type StepButtonProps = MetricProps & {
  $disabled: boolean;
};

export const Root = styled.View<MetricProps>`
  min-width: 0;

  flex-basis: 47%;
  flex-grow: 1;

  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme, $metricKey }) =>
    theme.colors.metrics[$metricKey].border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme, $metricKey }) =>
    theme.colors.metrics[$metricKey].background};
`;

export const Header = styled.View`
  min-height: ${ss.px(32)};

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Label = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};

  font-weight: ${({ theme }) => theme.weight.black};
`;

export const Stepper = styled.View<MetricProps>`
  min-height: ${ss.px(42)};

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.xs)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme, $metricKey }) =>
    theme.colors.metrics[$metricKey].border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const StepButton = styled.Pressable<StepButtonProps>`
  width: ${ss.px(34)};
  height: ${ss.px(34)};

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $metricKey, $disabled }) =>
    $disabled ? theme.colors.border : theme.colors.metrics[$metricKey].border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
`;

export const getInputStyle = (
  theme: Theme,
  metricKey: DiaryMetricKey
): TextStyle => ({
  flex: 1,
  minWidth: 0,

  height: 34,
  minHeight: 34,

  borderWidth: 0,

  backgroundColor: 'transparent',

  paddingTop: 0,
  paddingBottom: 0,
  paddingRight: 0,
  paddingLeft: 0,
  paddingHorizontal: theme.spacing.xs,

  color: theme.colors.metrics[metricKey].text,

  fontSize: theme.size.lg,
  lineHeight: theme.lineHeight.xl,

  fontWeight: theme.weight.black as TextStyle['fontWeight'],
});
