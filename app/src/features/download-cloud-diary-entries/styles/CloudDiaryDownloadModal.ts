import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Header = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Title = styled.Text``;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
`;

export const StrategyList = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const StrategyContent = styled.View`
  align-items: flex-start;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const StrategyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const StrategyDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
`;

export const ConflictProgress = styled.View`
  padding: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.primary};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const ConflictProgressText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
`;

export const Comparison = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ComparisonSection = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ComparisonLabel = styled.Text``;

export const ReviewOptions = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const CheckboxText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};
`;

export const Actions = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Action = styled.View`
  flex: 1;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  text-align: center;
`;

export const InputButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  text-align: center;
`;

export const Progress = styled.View`
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing['2xl'])};
`;

export const ProgressText = styled.Text``;

export const ResultGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ResultItem = styled.View`
  flex-grow: 1;
  flex-basis: 45%;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const ResultLabel = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
`;

export const ResultValue = styled.Text``;

export const ResultDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
`;

export const Done = styled.View`
  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;
