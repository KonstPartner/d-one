import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

export const Root = styled.View`
  width: 100%;

  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Action = styled(Button)`
  flex: 1;
`;
