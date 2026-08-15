import styled from '@emotion/native';

import * as ss from '@shared/styles';

type ProgressFillProps = {
  $percent: number;
};

export const CenteredSection = styled.View`
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ResultCenteredSection = styled(CenteredSection)`
  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const FailureCenteredSection = styled(CenteredSection)`
  padding-vertical: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const ProgressRing = styled.View`
  width: ${ss.px(76)};
  height: ${ss.px(76)};

  align-items: center;
  justify-content: center;
`;

export const ProgressRingIcon = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  align-items: center;
  justify-content: center;
`;

export const SuccessIcon = styled.View`
  width: ${ss.px(68)};
  height: ${ss.px(68)};

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.xl)};

  background-color: ${({ theme }) => theme.colors.shades.success.sm};
`;

export const FailureIcon = styled.View`
  width: ${ss.px(68)};
  height: ${ss.px(68)};

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.xl)};

  background-color: ${({ theme }) => theme.colors.shades.danger.sm};
`;

export const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const StatCard = styled.View`
  width: 48%;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const PrimaryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const ProgressCard = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ProgressBlock = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const ProgressTrack = styled.View`
  height: ${ss.px(7)};

  overflow: hidden;

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const ProgressFill = styled.View<ProgressFillProps>`
  width: ${({ $percent }) => `${$percent}%`};
  height: 100%;

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.primary};
`;

export const LockedNotice = styled.View`
  flex-direction: row;
  align-items: flex-start;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.shades.warning.lg};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.shades.warning.sm};
`;

export const LockedNoticeText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.shades.warning.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;
