import styled from '@emotion/native';

import { Button } from '@shared/ui';

export const Root = styled(Button)`
  min-height: 48px;

  align-items: center;
  justify-content: center;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: transparent;

  color: ${({ theme }) => theme.colors.danger};

  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

export const Text = styled.Text`
  color: ${({ theme }) => theme.colors.danger};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;
