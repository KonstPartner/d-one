import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Center = styled.View`
  ${ss.CenterContent};

  flex: 1;

  margin-top: ${({ theme }) => ss.px(theme.spacing['5xl'])};
  margin-bottom: ${({ theme }) => ss.px(theme.spacing['5xl'])};
`;
