import styled from '@emotion/native';
import type { ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import * as ss from '@shared/styles';

type AppliedProps = {
  $applied: boolean;
};

export const Root = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};

  border-bottom-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Heading(theme)};
`;

export const Scroll = styled(ScrollView)`
  flex: 1;
`;

export const scrollContentStyle: ViewStyle = {
  gap: 12,

  paddingTop: 12,
  paddingBottom: 24,
};

export const SectionCard = styled.View`
  ${({ theme }) => ss.Surface(theme, 'card')};

  ${({ theme }) => ss.Rounded(theme, 'lg')};

  ${({ theme }) => ss.Shadow(theme, 'soft')};

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const SectionTitle = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};
`;

export const ApplyError = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme }) => theme.colors.danger};

  font-weight: ${({ theme }) => theme.weight.bold};

  text-align: center;
`;

export const Footer = styled.View`
  flex-direction: row;

  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.md)};

  border-top-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const footerButtonStyle: ViewStyle = {
  flex: 1,
};

export const SecondaryButtonText = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.text};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const ApplyButtonContent = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const ApplyButtonText = styled.Text<AppliedProps>`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme, $applied }) =>
    $applied ? theme.colors.muted : theme.colors.white};

  font-weight: ${({ theme }) => theme.weight.bold};
`;
