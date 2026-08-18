import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Form = styled.View`
  ${({ theme }) => ss.Stack(theme, 'sm')};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'default', 'lg')};
`;

export const SubmitButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'inverse', 'md')};

  text-align: center;
`;
