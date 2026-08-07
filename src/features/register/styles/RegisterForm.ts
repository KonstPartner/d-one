import styled from '@emotion/native';

import { Button, Input, PasswordInput } from '@shared/ui';

export const Form = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const TextInput = styled(Input)`
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

export const PasswordField = styled(PasswordInput)`
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

export const SubmitButton = styled(Button)`
  min-height: 48px;

  border-radius: ${({ theme }) => theme.radius.md}px;

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
