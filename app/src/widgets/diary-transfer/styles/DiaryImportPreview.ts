import styled from '@emotion/native';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type StrategyOptionProps = {
  $selected: boolean;
};

type MetaValueProps = {
  $warning?: boolean;
};

export const Scroll = styled.ScrollView`
  width: 100%;
  flex: 1;
`;

export const Content = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Intro = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const IntroTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const IntroDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const MetaList = styled.View`
  width: 100%;
  overflow: hidden;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const MetaRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-bottom-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const MetaLabel = styled.Text`
  flex-shrink: 1;

  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const MetaValue = styled.Text<MetaValueProps>`
  flex-shrink: 1;

  color: ${({ theme, $warning }) =>
    $warning ? theme.colors.warning : theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
  text-align: right;
`;

export const StrategyList = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const StrategyOption = styled.Pressable<StrategyOptionProps>`
  width: 100%;

  flex-direction: row;
  align-items: flex-start;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const StrategyDot = styled.View<StrategyOptionProps>`
  width: ${({ theme }) => ss.px(theme.spacing.lg)};
  height: ${({ theme }) => ss.px(theme.spacing.lg)};

  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const StrategyDotInner = styled.View`
  width: ${({ theme }) => ss.px(theme.spacing.sm)};
  height: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-radius: ${({ theme }) => ss.px(theme.spacing.sm)};
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const StrategyContent = styled.View`
  flex: 1;
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const StrategyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const StrategyDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ActionRow = styled.View`
  width: 100%;
  flex-direction: row;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const SummaryCard = styled.View`
  width: 100%;
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const StatGrid = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Stat = styled.View`
  width: 48%;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const StatValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const StatLabel = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const actionButtonStyle: ViewStyle = {
  flex: 1,
};

export const getStrategyPressStyle = ({
  pressed,
}: PressableStateCallbackType): ViewStyle => ({
  opacity: pressed ? 0.7 : 1,
});

export const LoadingState = styled.View`
  width: 100%;
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;
