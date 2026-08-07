import styled from '@emotion/native';

export const Root = styled.View`
  width: 100%;
  max-width: 420px;
  align-self: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const Brand = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const Logo = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 21px;
`;

export const BrandName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  font-weight: 900;
  line-height: 25px;
  text-align: center;
`;

export const ScreenTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 26px;
  font-weight: 700;
  line-height: 32px;
`;

export const LoginContent = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Divider = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const DividerText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
`;

export const SwitchRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SwitchText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const SwitchLink = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;
