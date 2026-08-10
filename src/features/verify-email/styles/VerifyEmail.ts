import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

export const Container = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.Stack(theme, 'xl')};
  ${({ theme }) => ss.InsetY(theme, 'xl')};

  flex: 1;
  max-width: 420px;

  align-self: center;
  justify-content: center;
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'xl', 'bold', 'default', '2xl')};

  text-align: center;
`;

export const Description = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'regular', 'muted', 'md')};

  max-width: 320px;
  align-self: center;

  text-align: center;
`;

export const Email = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'bold', 'default', 'md')};

  align-self: center;
  text-align: center;
`;

export const SubmitButton = styled(Button)`
  ${ss.FullWidth};
`;

export const ButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'inverse', 'md')};

  text-align: center;
`;
