import styled from '@emotion/native';

import * as ss from '@shared/styles';

import { Button } from '../Button';

type DayContainerProps = {
  $selected: boolean;
  $today: boolean;
  $disabled: boolean;
  $highlightSelected: boolean;
};

type DayTextProps = {
  $selected: boolean;
  $disabled: boolean;
};

export const Root = styled.View`
  ${({ theme }) => ss.Stack(theme, 'md')};
`;

export const WeekHeader = styled.View`
  ${ss.CenterContent};

  padding-top: 18px;
  padding-bottom: 6px;
`;

export const WeekHeaderText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme }) => theme.weight.semibold};
`;

export const Day = styled.Pressable``;

export const DayContainer = styled.View<DayContainerProps>`
  ${({ theme }) => ss.Rounded(theme, 'full')};

  width: 40px;
  height: 40px;

  background-color: ${({ theme, $selected, $highlightSelected }) =>
    $highlightSelected && $selected ? theme.colors.primary : 'transparent'};

  border-width: ${({ theme, $today }) =>
    ss.px($today ? theme.border.width.md : 0)};

  border-color: ${({ theme, $today }) =>
    $today ? theme.colors.primary : 'transparent'};

  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

export const DayText = styled.Text<DayTextProps>`
  color: ${({ theme, $selected, $disabled }) => {
    if ($disabled) {
      return theme.colors.muted;
    }

    if ($selected) {
      return theme.colors.white;
    }

    return theme.colors.text;
  }};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme, $selected }) =>
    $selected ? theme.weight.bold : theme.weight.medium};
`;

export const DayDots = styled.View`
  flex-direction: row;
  justify-content: center;

  gap: 3px;

  margin-top: -10px;
`;

export const DayDot = styled.View<{
  $color: string;
}>`
  width: 4px;
  height: 4px;

  border-radius: 2px;

  background-color: ${({ $color }) => $color};
`;

export const BackButton = styled(Button)`
  ${({ theme }) => ss.Rounded(theme, 'full')};
`;

export const BackButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'regular', 'inverse', 'md')};
`;
