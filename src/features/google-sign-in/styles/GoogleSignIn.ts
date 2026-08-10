import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Button = styled.Pressable`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};

  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.medium};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;
