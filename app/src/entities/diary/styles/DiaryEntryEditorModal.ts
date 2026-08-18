import styled from '@emotion/native';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};

  border-bottom-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Heading(theme)};

  flex: 1;

  text-align: center;
`;

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.lg)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing['2xl'])};
`;

export const Footer = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.md)};

  border-top-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const actionStyle: ViewStyle = {
  flex: 1,
};

export const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const CancelText = styled.Text<DisabledProps>`
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.base)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
  font-weight: ${({ theme }) => theme.weight.semibold};
`;

export const SubmitText = styled.Text<DisabledProps>`
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.shades.primary.text : theme.colors.white};

  font-size: ${({ theme }) => ss.px(theme.size.base)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
  font-weight: ${({ theme }) => theme.weight.semibold};
`;
