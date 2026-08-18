import styled from '@emotion/native';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

export const Screen = styled.View`
  width: 100%;
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Content = styled.View`
  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const ResultHeader = styled.View`
  width: 100%;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const SuccessIcon = styled.View`
  width: ${ss.px(68)};
  height: ${ss.px(68)};

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.xl)};

  background-color: ${({ theme }) => theme.colors.shades.success.sm};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};

  text-align: center;
`;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};

  text-align: center;
`;

export const FileName = styled.Text`
  width: 100%;

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};

  text-align: center;
`;

export const StatsGrid = styled.View`
  width: 100%;

  flex-direction: row;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const StatCard = styled.View`
  flex-grow: 1;
  flex-basis: 46%;
  min-width: ${ss.px(120)};

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const StatValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const StatLabel = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const FileActions = styled.View`
  width: 100%;

  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const FileActionContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const FileActionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const Footer = styled.View`
  width: 100%;

  margin-top: auto;
`;

export const DoneText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const fileActionButtonStyle: ViewStyle = {
  flex: 1,
};
