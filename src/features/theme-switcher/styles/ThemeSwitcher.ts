import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

export const Container = styled.View`
  width: 128px;
  height: 40px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 4px;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 8px;

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ModeButton = styled.Pressable`
  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border-radius: 999px;
`;

export const getModeButtonStyle = (
  theme: Theme,
  selected: boolean
): ViewStyle => ({
  backgroundColor: selected ? theme.colors.primary : 'transparent',
});
