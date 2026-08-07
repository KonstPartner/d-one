import styled from '@emotion/native';

import { Button, PasswordInput } from '@shared/ui';

export const Form = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.lg}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.lg}px;
`;

export const PasswordField = styled(PasswordInput)`
  width: 100%;
`;

export const SubmitButton = styled(Button)`
  min-height: ${({ theme }) => theme.control.height.md}px;

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.md : theme.colors.primary};

  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.text : theme.colors.white};
`;

export const SubmitButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;
