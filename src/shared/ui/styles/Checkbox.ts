import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

export const Root = styled.Pressable`
  flex-direction: row;
  align-items: center;

  gap: 10px;

  padding: 6px 12px;

  border-radius: 10px;
`;

export const Indicator = styled.View`
  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border-width: 2px;
  border-radius: 2px;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const getIndicatorStyle = (
  theme: Theme,
  checked: boolean
): ViewStyle => ({
  borderColor: checked ? theme.colors.primary : theme.colors.border,

  backgroundColor: checked ? theme.colors.primary : theme.colors.bg,
});
