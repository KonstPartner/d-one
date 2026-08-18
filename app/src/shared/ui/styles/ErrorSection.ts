import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  ${({ theme }) => ss.Stack(theme, 'md')};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Message = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  text-align: center;
`;

export const RetryText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'inverse', 'md')};

  text-align: center;
`;
