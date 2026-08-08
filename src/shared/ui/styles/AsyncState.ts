import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Center = styled.View`
  ${ss.CenterContent};

  flex: 1;

  margin-top: ${({ theme }) => theme.spacing['5xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['5xl']}px;
`;
