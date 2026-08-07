import styled from '@emotion/native';

export const Trigger = styled.Pressable`
  align-self: center;
`;

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const Head = styled.View`
  gap: 6px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.xl}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight['2xl']}px;
`;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.size.sm}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;
