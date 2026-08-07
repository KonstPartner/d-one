import styled from '@emotion/native';

export const Button = styled.Pressable`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.bg};

  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.medium};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;
