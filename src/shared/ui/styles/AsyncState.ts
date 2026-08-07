import styled from '@emotion/native';

import { Button } from '../Button';

export const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin: 50px 0;
`;

export const ErrorContent = styled.View`
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const RetryButton = styled(Button)`
  min-height: ${({ theme }) => theme.control.height.md}px;

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme }) => theme.colors.primary};
`;

export const RetryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
`;
