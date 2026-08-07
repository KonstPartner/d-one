import styled from '@emotion/native';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  max-width: 420px;
  align-self: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.xl}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight['2xl']}px;
  text-align: center;
`;

export const Description = styled.Text`
  max-width: 320px;
  align-self: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
  text-align: center;
`;

export const Email = styled.Text`
  align-self: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
  text-align: center;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
`;
