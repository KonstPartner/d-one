import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button, Input, PasswordInput } from '@shared/ui';

export const Form = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const TextInput = styled(Input)`
  min-height: 48px;
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
`;

export const PasswordField = styled(PasswordInput)`
  min-height: 48px;
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
`;

export const PasswordAction = styled.View`
  width: 100%;
  align-items: flex-end;
  margin-top: -6px;
`;

export const SubmitButton = styled(Button)`
  min-height: 48px;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.md : theme.colors.primary};

  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.text : theme.colors.white};
`;

export const SubmitButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
  text-align: center;
`;
