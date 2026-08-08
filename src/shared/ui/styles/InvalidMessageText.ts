import styled from '@emotion/native';

export const Message = styled.Text`
  color: ${({ theme }) => theme.colors.danger};

  font-size: ${({ theme }) => theme.size.sm}px;

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => theme.lineHeight.sm}px;
`;
