import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ToolbarArea = styled.View`
  flex-shrink: 0;
`;

export const ListArea = styled.View`
  flex: 1;

  min-height: 0;
`;
