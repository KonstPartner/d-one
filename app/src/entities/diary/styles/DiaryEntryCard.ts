import styled from '@emotion/native';

import * as ss from '@shared/styles';
import type { SelectDropdownTone } from '@shared/ui';

type CardProps = {
  $selected: boolean;
};

type BodyProps = {
  $selectionActive: boolean;
};

type SelectionIndicatorProps = {
  $selected: boolean;
};

type MealRelationProps = {
  $tone: SelectDropdownTone;
};

export type DiaryMetricKey =
  | 'glucose'
  | 'carbsGram'
  | 'shortInsulin'
  | 'ultraShortInsulin'
  | 'longInsulin';

type MetricProps = {
  $metric: DiaryMetricKey;
};

export const Card = styled.Pressable<CardProps>`
  position: relative;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};

  overflow: hidden;
`;

export const SelectionIndicator = styled.View<SelectionIndicatorProps>`
  position: absolute;

  top: ${({ theme }) => ss.px(theme.spacing.sm)};

  left: ${({ theme }) => ss.px(theme.spacing.sm)};

  z-index: 2;

  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.card};
`;

export const Body = styled.View<BodyProps>`
  ${({ theme }) => ss.Inset(theme, 'md')};

  padding-left: ${({ theme, $selectionActive }) =>
    ss.px(
      theme.spacing.md +
        ($selectionActive ? theme.control.height.sm + theme.spacing.sm : 0)
    )};

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Header = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Time = styled.View`
  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const TimeText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  font-weight: ${({ theme }) => theme.weight.black};
`;

export const MealRelation = styled.View<MealRelationProps>`
  flex-direction: row;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.xs)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $tone }) => theme.colors.shades[$tone].lg};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme, $tone }) => theme.colors.shades[$tone].sm};
`;

export const MealRelationText = styled.Text<MealRelationProps>`
  color: ${({ theme, $tone }) => theme.colors[$tone]};

  font-size: ${({ theme }) => ss.px(theme.size.xs)};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.xs)};

  font-weight: ${({ theme }) => theme.weight.heavy};
`;

export const Metrics = styled.View`
  flex-direction: row;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Metric = styled.View<MetricProps>`
  min-width: 132px;
  min-height: 52px;

  flex-basis: 47%;
  flex-grow: 1;

  flex-direction: row;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $metric }) => theme.colors.metrics[$metric].border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $metric }) =>
    theme.colors.metrics[$metric].background};
`;

export const MetricIcon = styled.View`
  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;
`;

export const MetricValue = styled.Text<MetricProps>`
  color: ${({ theme, $metric }) => theme.colors.metrics[$metric].text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.xl)};

  font-weight: ${({ theme }) => theme.weight.black};
`;

export const Status = styled.View`
  min-height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-self: flex-start;

  align-items: center;
  justify-content: center;
`;
