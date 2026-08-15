import styled from '@emotion/native';

import * as ss from '@shared/styles';

type ProgressFillProps = {
  $progress: number;
};

type ResultIconProps = {
  $tone: 'success' | 'danger';
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

export const ProgressCard = styled.View`
  width: 100%;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
  padding: ${({ theme }) => ss.px(theme.spacing.xl)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.xl)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ProgressIcon = styled.View`
  width: ${({ theme }) => ss.px(theme.control.height.lg + theme.spacing.xl)};
  height: ${({ theme }) => ss.px(theme.control.height.lg + theme.spacing.xl)};

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => ss.px(theme.control.height.lg)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const ProgressTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  text-align: center;
`;

export const ProgressDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
  text-align: center;
`;

export const ProgressBlock = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ProgressHead = styled.View`
  width: 100%;

  flex-direction: row;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ProgressText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const ProgressTrack = styled.View`
  width: 100%;
  height: ${({ theme }) => ss.px(theme.spacing.sm)};

  overflow: hidden;

  border-radius: ${({ theme }) => ss.px(theme.spacing.sm)};
  background-color: ${({ theme }) => theme.colors.input};
`;

export const ProgressFill = styled.View<ProgressFillProps>`
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;

  border-radius: ${({ theme }) => ss.px(theme.spacing.sm)};
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const LockNote = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const LockText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ResultHero = styled.View`
  width: 100%;

  align-items: center;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ResultIcon = styled.View<ResultIconProps>`
  width: ${({ theme }) => ss.px(theme.control.height.lg + theme.spacing.xl)};
  height: ${({ theme }) => ss.px(theme.control.height.lg + theme.spacing.xl)};

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.xl)};
  background-color: ${({ theme, $tone }) =>
    $tone === 'success' ? theme.colors.success : theme.colors.danger};
`;

export const ResultTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  text-align: center;
`;

export const ResultDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
  text-align: center;
`;

export const ResultGrid = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ResultStat = styled.View`
  width: 48%;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ResultStatValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const ResultStatLabel = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const CloudWarning = styled.View`
  width: 100%;

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const CloudWarningText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;
