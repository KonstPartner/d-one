import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

type InputProps = {
  $invalid: boolean;
};

export const Root = styled.View`
  ${({ theme }) => ss.Surface(theme, 'card')};

  ${({ theme }) => ss.Rounded(theme, 'lg')};

  ${({ theme }) => ss.Shadow(theme, 'soft')};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Header = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  margin-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};
`;

export const ResetTextButton = styled.Pressable<DisabledProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.sm)};

  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  opacity: ${({ $disabled }) => ($disabled ? 0.38 : 1)};
`;

export const ResetText = styled.Text<DisabledProps>`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.primary};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const SliderHost = styled.View`
  width: 100%;
`;

export const Inputs = styled.View`
  flex-direction: row;

  align-items: flex-end;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const InputColumn = styled.View`
  flex: 1;

  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const InputLabel = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme }) => theme.colors.muted};

  font-weight: ${({ theme }) => theme.weight.medium};
`;

export const Input = styled.TextInput<InputProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $invalid }) =>
    $invalid ? theme.colors.danger : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
`;

export const getResetButtonStyle = (theme: Theme): ViewStyle => ({
  width: theme.control.height.md,

  paddingHorizontal: 0,
  paddingVertical: 0,
});

export const ErrorText = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};

  color: ${({ theme }) => theme.colors.danger};

  font-weight: ${({ theme }) => theme.weight.bold};
`;
