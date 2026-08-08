import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button, PasswordInput } from '@shared/ui';

export const Form = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.Stack(theme, 'sm')};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'default', 'lg')};
`;

export const PasswordField = styled(PasswordInput)`
  ${ss.FullWidth};
`;

export const SubmitButton = styled(Button)`
  ${ss.FullWidth};
`;

export const SubmitButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'inverse', 'md')};

  text-align: center;
`;
