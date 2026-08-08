import styled from '@emotion/native';

import { Button } from '@shared/ui';

export const Root = styled(Button)`
  min-height: 48px;
`;

export const Text = styled.Text`
  color: ${({ theme }) => theme.colors.danger};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;
